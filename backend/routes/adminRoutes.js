const express = require('express');

module.exports = (pool, authenticateToken) => {
    const router = express.Router();

    // 3. Admin: Get all projects
    router.get('/projects', authenticateToken, async (req, res) => {
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
    router.post('/assign', authenticateToken, async (req, res) => {
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

    // 8. Get Managers for Admin dropdown
    router.get('/managers', authenticateToken, async (req, res) => {
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
    router.get('/managers/all', authenticateToken, async (req, res) => {
        if (req.user.role !== 'ADMIN') return res.sendStatus(403);
        try {
            const [managers] = await pool.query('SELECT id, username, full_name, created_at FROM Users WHERE role = "MANAGER" ORDER BY id DESC');
            res.json(managers);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    router.post('/managers', authenticateToken, async (req, res) => {
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

    router.put('/managers/:id', authenticateToken, async (req, res) => {
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

    router.delete('/managers/:id', authenticateToken, async (req, res) => {
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

    // 12. Admin: Get all inquiries
    router.get('/inquiries', authenticateToken, async (req, res) => {
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
    router.put('/inquiries/:id/read', authenticateToken, async (req, res) => {
        if (req.user.role !== 'ADMIN') return res.sendStatus(403);
        
        try {
            await pool.query('UPDATE ContactInquiries SET status = ? WHERE id = ?', ['READ', req.params.id]);
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
