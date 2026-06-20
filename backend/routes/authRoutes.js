const express = require('express');

module.exports = (pool, jwt, JWT_SECRET, authenticateToken) => {
    const router = express.Router();

    // 1. Authentication Login
    router.post('/login', async (req, res) => {
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
    router.post('/signup', async (req, res) => {
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

    // 10. Get Current User Data
    router.get('/me', authenticateToken, async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT id, username, role, full_name FROM Users WHERE id = ?', [req.user.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
