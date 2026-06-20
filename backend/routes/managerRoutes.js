const express = require('express');

module.exports = (pool, authenticateToken) => {
    const router = express.Router();

    // 5. Manager: Get assigned projects
    router.get('/projects', authenticateToken, async (req, res) => {
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
    router.post('/update-phase', authenticateToken, async (req, res) => {
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
    router.post('/update-project-data', authenticateToken, async (req, res) => {
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

    return router;
};
