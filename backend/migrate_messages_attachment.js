const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'YT_solutions',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function migrate() {
    try {
        console.log('Adding file attachment columns to Messages table...');
        await pool.query('ALTER TABLE Messages ADD COLUMN file_url VARCHAR(255) NULL;');
        await pool.query('ALTER TABLE Messages ADD COLUMN file_name VARCHAR(255) NULL;');
        console.log('Messages table altered successfully.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist. Skipping.');
        } else {
            console.error('Error altering table:', err);
        }
    } finally {
        process.exit(0);
    }
}

migrate();
