const mysql = require('mysql2/promise');
async function checkDb() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'rootpassword',
        database: 'YT_solutions'
    });
    
    const [projects] = await pool.query('SELECT * FROM Projects');
    console.log('--- ALL PROJECTS ---');
    console.log(projects);

    const [invoices] = await pool.query('SELECT * FROM Invoices');
    console.log('\n--- ALL INVOICES ---');
    console.log(invoices);
    
    process.exit(0);
}
checkDb().catch(console.error);
