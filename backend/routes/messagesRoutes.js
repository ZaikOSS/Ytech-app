const express = require('express');
const logger = require('../logger');

module.exports = (pool, authenticateToken, upload) => {
    const router = express.Router();

    // 9. Get Messages
    router.get('/:projectId', authenticateToken, async (req, res) => {
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
    router.post('/', authenticateToken, (req, res, next) => {
        logger.info('File upload started', { userId: req.user.id, type: 'upload_started' });
        upload.single('attachment')(req, res, (err) => {
            if (err) {
                logger.warn('Malicious or invalid upload blocked', { userId: req.user.id, error: err.message, ip: req.ip, type: 'upload_rejected' });
                return res.status(400).json({ error: err.message });
            }
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
            logger.warn('Message rate limit exceeded', { userId, ip: req.ip, type: 'rate_limit' });
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
            
            if (file) {
                logger.info('File upload completed', { userId, fileName, fileUrl, type: 'upload_completed' });
            }

            res.json({ success: true, fileUrl, fileName });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
