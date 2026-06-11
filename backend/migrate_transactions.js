const mysql = require('mysql2/promise');

async function migrate() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'rootpassword',
        database: 'YT_solutions'
    });

    try {
        await pool.query('ALTER TABLE Transactions ADD COLUMN zipcode VARCHAR(20)');
    } catch (e) { console.log('zipcode may exist', e.message); }

    try {
        await pool.query('ALTER TABLE Transactions ADD COLUMN company_name VARCHAR(255)');
    } catch (e) { console.log('company_name may exist', e.message); }
    
    try {
        await pool.query('ALTER TABLE Transactions ADD COLUMN email VARCHAR(255)');
    } catch (e) { console.log('email may exist', e.message); }

    console.log("Transactions table altered.");
    await pool.end();
}

migrate();
