const mysql = require('mysql2/promise');

async function wipeDatabase() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'rootpassword',
        database: 'YT_solutions'
    });

    try {
        console.log('Starting database wipe...');

        // 1. Delete Transactions (Depends on Invoices)
        await pool.query('DELETE FROM Transactions');
        console.log('✅ Transactions deleted.');

        // 2. Delete Invoices (Depends on Projects)
        await pool.query('DELETE FROM Invoices');
        console.log('✅ Invoices deleted.');

        // 3. Delete Messages (Depends on Projects)
        await pool.query('DELETE FROM Messages');
        console.log('✅ Messages deleted.');

        // 4. Delete Projects (Depends on Users)
        await pool.query('DELETE FROM Projects');
        console.log('✅ Projects deleted.');

        // 4. Delete Users (Except Admin ID 1 and First Manager ID 2)
        const [result] = await pool.query('DELETE FROM Users WHERE id > 2');
        console.log(`✅ Users deleted. Removed ${result.affectedRows} users.`);

        // 5. Reset Auto-Increments (Optional but good for fresh start)
        await pool.query('ALTER TABLE Transactions AUTO_INCREMENT = 1');
        await pool.query('ALTER TABLE Invoices AUTO_INCREMENT = 1');
        await pool.query('ALTER TABLE Projects AUTO_INCREMENT = 1');
        await pool.query('ALTER TABLE Users AUTO_INCREMENT = 3');

        console.log('\n🎉 Database successfully wiped clean! Only Admin (1) and Sarah (2) remain.');
        process.exit(0);
    } catch (err) {
        console.error('Error during wipe:', err);
        process.exit(1);
    }
}

wipeDatabase();
