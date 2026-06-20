const express = require('express');

module.exports = (pool, authenticateToken, genAI) => {
    const router = express.Router();

    // 2. Custom Validation & Local Checkout
    router.post('/checkout', authenticateToken, async (req, res) => {
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

    // 11. Public Contact Us Form
    router.post('/contact', async (req, res) => {
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

    // 14. Public: AI Chatbot
    router.post('/ai/chat', async (req, res) => {
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

    return router;
};
