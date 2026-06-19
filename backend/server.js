const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_ytech_key';

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only images and PDFs are allowed'));
    }
});

// Middleware
app.use(cors());

// --- STRIPE WEBHOOK ---
// Must be defined BEFORE express.json() so we get the raw body!
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''; // We will get this from Stripe CLI

    let event;
    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // Fallback for local testing if secret not set properly, though verification is recommended
            event = JSON.parse(req.body);
        }
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Use client_reference_id as the user ID
        const userId = session.client_reference_id;
        const amount = session.amount_total / 100; // Stripe amounts are in cents
        const email = session.customer_details?.email || 'stripe-customer@example.com';
        const name = session.customer_details?.name || 'Stripe Customer';
        
        if (userId) {
            try {
                // 1. Create project
                const [projResult] = await pool.query(
                    'INSERT INTO Projects (client_id, status, current_phase) VALUES (?, ?, ?)',
                    [userId, 'PAID', 1]
                );
                const projectId = projResult.insertId;

                // 2. Generate Invoice
                const invoiceNumber = `#YT-STRIPE-${Math.floor(1000 + Math.random() * 9000)}`;
                const [invResult] = await pool.query(
                    'INSERT INTO Invoices (project_id, invoice_number, amount, status) VALUES (?, ?, ?, ?)',
                    [projectId, invoiceNumber, amount, 'PAID']
                );
                const invoiceId = invResult.insertId;

                // 3. Record Transaction
                await pool.query(
                    'INSERT INTO Transactions (invoice_id, cardholder_name, card_details_string, zipcode, company_name, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [invoiceId, name, 'Stripe Checkout', 'N/A', 'N/A', email, 'SUCCESS']
                );
                
                console.log(`Successfully processed Stripe payment for User ID ${userId}`);
            } catch (dbErr) {
                console.error('Database error fulfilling Stripe order:', dbErr);
            }
        } else {
            console.warn('Received Stripe session without client_reference_id');
        }
    }

    res.json({received: true});
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Pool
const pool = mysql.createPool({
  host: 'localhost', // Assuming we run node locally and connect to docker mysql on localhost:3306
  user: 'root',
  password: 'rootpassword',
  database: 'YT_solutions',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- API ROUTES ---

// 1. Authentication Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = rows[0];
        // In local dev, plain text comparison. 
        if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 1.5 Authentication Signup
app.post('/api/signup', async (req, res) => {
    const { username, password, full_name, role = 'CLIENT' } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });
        
        const [result] = await pool.query('INSERT INTO Users (username, password, role, full_name) VALUES (?, ?, ?, ?)', [username, password, role, full_name]);
        
        const token = jwt.sign({ id: result.insertId, role, username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: result.insertId,
                username,
                role,
                full_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// 2. Custom Validation & Local Checkout
app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { cardholderName, cardNumber, expires, cvv, zipcode, companyName, email, amount } = req.body;
    
    // Basic Luhn Algorithm Implementation
    const isLuhnValid = (num) => {
        let arr = (num + '')
          .split('')
          .reverse()
          .map(x => parseInt(x));
        let lastDigit = arr.splice(0, 1)[0];
        let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
        sum += lastDigit;
        return sum % 10 === 0;
    };

    const cleanCardNum = cardNumber ? cardNumber.replace(/\D/g, '') : '';
    
    if (!cleanCardNum || cleanCardNum.length < 13 || !isLuhnValid(cleanCardNum)) {
        return res.status(400).json({ error: 'Payment validation failed. Invalid card number.' });
    }

    if (!expires || !cvv || !cardholderName || !zipcode) {
        return res.status(400).json({ error: 'Please fill in all required payment details.' });
    }

    try {
        // Create a project for the client
        const [projResult] = await pool.query(
            'INSERT INTO Projects (client_id, status, current_phase) VALUES (?, ?, ?)',
            [req.user.id, 'PAID', 1]
        );
        const projectId = projResult.insertId;

        // Generate Invoice
        const invoiceNumber = `#YT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const invoiceAmount = amount || 1500.00;
        const [invResult] = await pool.query(
            'INSERT INTO Invoices (project_id, invoice_number, amount, status) VALUES (?, ?, ?, ?)',
            [projectId, invoiceNumber, invoiceAmount, 'PAID'] 
        );
        const invoiceId = invResult.insertId;

        // Safe Storage: Only keep last 4 digits
        const last4 = cleanCardNum.slice(-4);
        const safeCardString = `**** **** **** ${last4} | Exp: ${expires}`;

        // Record Transaction
        await pool.query(
            'INSERT INTO Transactions (invoice_id, cardholder_name, card_details_string, zipcode, company_name, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [invoiceId, cardholderName, safeCardString, zipcode, companyName, email, 'SUCCESS']
        );

        res.json({ message: 'Payment successful', invoice: invoiceNumber, projectId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during checkout' });
    }
});

// 3. Admin: Get all projects
app.get('/api/admin/projects', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.status, p.current_phase, p.created_at, p.project_data, u.full_name as client_name, m.full_name as manager_name
            FROM Projects p
            JOIN Users u ON p.client_id = u.id
            LEFT JOIN Users m ON p.manager_id = m.id
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. Admin: Assign Manager
app.post('/api/admin/assign', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { projectId, managerId } = req.body;
    try {
        await pool.query('UPDATE Projects SET manager_id = ? WHERE id = ?', [managerId, projectId]);
        res.json({ message: 'Manager assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. Manager: Get assigned projects
app.get('/api/manager/projects', authenticateToken, async (req, res) => {
    if (req.user.role !== 'MANAGER') return res.sendStatus(403);
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.status, p.current_phase, p.created_at, p.project_data, u.full_name as client_name 
            FROM Projects p
            JOIN Users u ON p.client_id = u.id
            WHERE p.manager_id = ?
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 6. Manager: Update milestone
app.post('/api/manager/update-phase', authenticateToken, async (req, res) => {
    if (req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { projectId, newPhase } = req.body;
    try {
        const query = req.user.role === 'ADMIN' 
            ? 'UPDATE Projects SET current_phase = ? WHERE id = ?' 
            : 'UPDATE Projects SET current_phase = ? WHERE id = ? AND manager_id = ?';
        const params = req.user.role === 'ADMIN' ? [newPhase, projectId] : [newPhase, projectId, req.user.id];
        await pool.query(query, params);
        res.json({ message: 'Phase updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 6b. Manager: Update project data
app.post('/api/manager/update-project-data', authenticateToken, async (req, res) => {
    if (req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { projectId, projectData } = req.body;
    try {
        const [rows] = await pool.query('SELECT project_data FROM Projects WHERE id = ?', [projectId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        
        let existingData = typeof rows[0].project_data === 'string' ? JSON.parse(rows[0].project_data) : (rows[0].project_data || {});
        
        const newData = {
            ...existingData,
            designImages: projectData.designImages !== undefined ? projectData.designImages : existingData.designImages,
            devProgress: projectData.devProgress !== undefined ? projectData.devProgress : existingData.devProgress,
            liveUrl: projectData.liveUrl !== undefined ? projectData.liveUrl : existingData.liveUrl
        };

        const query = req.user.role === 'ADMIN' 
            ? 'UPDATE Projects SET project_data = ? WHERE id = ?' 
            : 'UPDATE Projects SET project_data = ? WHERE id = ? AND manager_id = ?';
        const params = req.user.role === 'ADMIN' ? [JSON.stringify(newData), projectId] : [JSON.stringify(newData), projectId, req.user.id];
        await pool.query(query, params);
        res.json({ message: 'Project data updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 6c. Client: Update project data
app.post('/api/client/update-project-data', authenticateToken, async (req, res) => {
    if (req.user.role !== 'CLIENT' && req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { projectId, projectData } = req.body;
    try {
        const [rows] = await pool.query('SELECT project_data FROM Projects WHERE id = ?', [projectId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        
        let existingData = typeof rows[0].project_data === 'string' ? JSON.parse(rows[0].project_data) : (rows[0].project_data || {});
        
        const newData = {
            ...existingData,
            questionnaire: projectData.questionnaire !== undefined ? projectData.questionnaire : existingData.questionnaire
        };

        const query = req.user.role === 'ADMIN' 
            ? 'UPDATE Projects SET project_data = ? WHERE id = ?' 
            : 'UPDATE Projects SET project_data = ? WHERE id = ? AND client_id = ?';
        const params = req.user.role === 'ADMIN' ? [JSON.stringify(newData), projectId] : [JSON.stringify(newData), projectId, req.user.id];
        await pool.query(query, params);
        res.json({ message: 'Project data updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 7. Client: Get my projects info
app.get('/api/client/projects', authenticateToken, async (req, res) => {
    if (req.user.role !== 'CLIENT') return res.sendStatus(403);
    try {
        const [projects] = await pool.query(`
            SELECT p.*, m.full_name as manager_name 
            FROM Projects p 
            LEFT JOIN Users m ON p.manager_id = m.id 
            WHERE p.client_id = ? ORDER BY p.id DESC
        `, [req.user.id]);
        
        const results = [];
        for (let proj of projects) {
            const [invoices] = await pool.query('SELECT * FROM Invoices WHERE project_id = ?', [proj.id]);
            let invoiceDetails = invoices.length > 0 ? invoices[0] : null;
            if (invoiceDetails) {
                const [transactions] = await pool.query('SELECT * FROM Transactions WHERE invoice_id = ?', [invoiceDetails.id]);
                if (transactions.length > 0) {
                    invoiceDetails.transaction = transactions[0];
                }
            }
            results.push({ project: proj, invoice: invoiceDetails });
        }
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 8. Get Managers for Admin dropdown
app.get('/api/admin/managers', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        const [rows] = await pool.query('SELECT id, full_name FROM Users WHERE role = "MANAGER"');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Manage Managers
app.get('/api/admin/managers/all', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        const [managers] = await pool.query('SELECT id, username, full_name, created_at FROM Users WHERE role = "MANAGER" ORDER BY id DESC');
        res.json(managers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/managers', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { full_name, username, password } = req.body;
    if (!full_name || !username || !password) return res.status(400).json({ error: 'All fields are required' });
    try {
        const [existing] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });
        
        await pool.query('INSERT INTO Users (username, password, role, full_name) VALUES (?, ?, "MANAGER", ?)', [username, password, full_name]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/managers/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { id } = req.params;
    const { full_name, username, password } = req.body;
    if (!full_name || !username) return res.status(400).json({ error: 'Full name and username are required' });
    try {
        const [existing] = await pool.query('SELECT * FROM Users WHERE username = ? AND id != ?', [username, id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });
        
        if (password) {
            await pool.query('UPDATE Users SET username = ?, full_name = ?, password = ? WHERE id = ? AND role = "MANAGER"', [username, full_name, password, id]);
        } else {
            await pool.query('UPDATE Users SET username = ?, full_name = ? WHERE id = ? AND role = "MANAGER"', [username, full_name, id]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/managers/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { id } = req.params;
    try {
        await pool.query('UPDATE Projects SET manager_id = NULL WHERE manager_id = ?', [id]);
        await pool.query('DELETE FROM Users WHERE id = ? AND role = "MANAGER"', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 9. Get Messages
app.get('/api/messages/:projectId', authenticateToken, async (req, res) => {
    const { projectId } = req.params;
    try {
        // Simple auth check: if client, must own project. If manager, must manage it. Admin can see all.
        const [projects] = await pool.query('SELECT client_id, manager_id FROM Projects WHERE id = ?', [projectId]);
        if (projects.length === 0) return res.sendStatus(404);
        const proj = projects[0];
        
        if (req.user.role === 'CLIENT' && proj.client_id !== req.user.id) return res.sendStatus(403);
        if (req.user.role === 'MANAGER' && proj.manager_id !== req.user.id) return res.sendStatus(403);

        const [messages] = await pool.query(`
            SELECT m.*, u.full_name as sender_name, u.role as sender_role 
            FROM Messages m 
            JOIN Users u ON m.sender_id = u.id 
            WHERE m.project_id = ? 
            ORDER BY m.created_at ASC
        `, [projectId]);
        
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Simple rate limiter in memory
const messageRateLimits = {};

// 10. Post Message
app.post('/api/messages', authenticateToken, (req, res, next) => {
    upload.single('attachment')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}, async (req, res) => {
    const { projectId, messageText } = req.body || {};
    const file = req.file;
    
    // Text size check
    if (!file && (!messageText || messageText.length === 0)) {
        return res.status(400).json({ error: 'Message must contain text or an attachment.' });
    }
    if (messageText && messageText.length > 500) {
        return res.status(400).json({ error: 'Message must be under 500 characters.' });
    }

    // Rate Limiting check: max 5 msgs per minute
    const userId = req.user.id;
    const now = Date.now();
    if (!messageRateLimits[userId]) messageRateLimits[userId] = [];
    
    // Clean old timestamps
    messageRateLimits[userId] = messageRateLimits[userId].filter(ts => now - ts < 60000);
    
    if (messageRateLimits[userId].length >= 5) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute.' });
    }

    try {
        // Auth check
        const [projects] = await pool.query('SELECT client_id, manager_id FROM Projects WHERE id = ?', [projectId]);
        if (projects.length === 0) return res.sendStatus(404);
        const proj = projects[0];
        
        if (req.user.role === 'CLIENT' && proj.client_id !== req.user.id) return res.sendStatus(403);
        if (req.user.role === 'MANAGER' && proj.manager_id !== req.user.id) return res.sendStatus(403);

        const fileUrl = file ? `/uploads/${file.filename}` : null;
        const fileName = file ? file.originalname : null;

        await pool.query('INSERT INTO Messages (project_id, sender_id, message_text, file_url, file_name) VALUES (?, ?, ?, ?, ?)', [projectId, userId, messageText || '', fileUrl, fileName]);
        
        // Record rate limit
        messageRateLimits[userId].push(now);

        res.json({ success: true, fileUrl, fileName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 11. Public Contact Us Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (message.length > 1000) {
        return res.status(400).json({ error: 'Message cannot exceed 1000 characters' });
    }
    
    try {
        await pool.query('INSERT INTO ContactInquiries (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
        res.json({ success: true, message: 'Inquiry received' });
    } catch (err) {
        console.error("Contact Form Error:", err);
        res.status(500).json({ error: 'Server error while submitting inquiry' });
    }
});

// 12. Admin: Get all inquiries
app.get('/api/admin/inquiries', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    
    try {
        const [rows] = await pool.query('SELECT * FROM ContactInquiries ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 13. Admin: Mark inquiry as READ
app.put('/api/admin/inquiries/:id/read', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    
    try {
        await pool.query('UPDATE ContactInquiries SET status = ? WHERE id = ?', ['READ', req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 14. Public: AI Chatbot
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const systemPrompt = `You are the official AI Assistant for YTech Solutions, a premium web development agency. 
Your goal is to answer visitor questions, be polite, professional, and guide them to purchase a package.
YTech Solutions offers two main packages:
1. Standard Package ($500): 3-page static website, basic SEO, contact form, 1-month support.
2. Premium Package ($1500): 5-page dynamic website, CMS integration, advanced SEO, e-commerce ready, 3-months support.
Our process has 5 phases: Payment -> Requirements -> Design -> Development -> Go-Live.
Please keep your answers concise (1-3 sentences max). Use a friendly, professional tone.`;

        let formattedHistory = [];
        if (history && history.length > 0) {
            formattedHistory = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            
            // Gemini requires the history array to start with a 'user' message
            if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
                formattedHistory.shift();
            }
        }

        const chat = model.startChat({
            history: formattedHistory,
            systemInstruction: { parts: [{ text: systemPrompt }] }
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();
        
        res.json({ text: response });
    } catch (err) {
        console.error("Gemini API Error:", err);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
