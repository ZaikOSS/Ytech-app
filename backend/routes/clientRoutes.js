const express = require('express');

module.exports = (pool, authenticateToken) => {
    const router = express.Router();

    // 6c. Client: Update project data
    router.post('/update-project-data', authenticateToken, async (req, res) => {
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
    router.get('/projects', authenticateToken, async (req, res) => {
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

    return router;
};
