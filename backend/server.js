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

// Database Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', 
  user: 'root',
  password: 'rootpassword',
  database: 'YT_solutions',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());

// --- STRIPE WEBHOOK ---
// Must be defined BEFORE express.json() so we get the raw body!
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;
    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            event = JSON.parse(req.body);
        }
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        const userId = session.client_reference_id;
        const amount = session.amount_total / 100;
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

// Auth Middleware
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

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');
const clientRoutes = require('./routes/clientRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const publicRoutes = require('./routes/publicRoutes');

// --- MOUNT ROUTES ---
app.use('/api', authRoutes(pool, jwt, JWT_SECRET, authenticateToken));
app.use('/api/admin', adminRoutes(pool, authenticateToken));
app.use('/api/manager', managerRoutes(pool, authenticateToken));
app.use('/api/client', clientRoutes(pool, authenticateToken));
app.use('/api/messages', messagesRoutes(pool, authenticateToken, upload));
app.use('/api', publicRoutes(pool, authenticateToken, genAI));

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}

module.exports = app;
