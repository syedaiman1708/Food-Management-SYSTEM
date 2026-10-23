const mysql = require('mysql2/promise');

let pool = null;
let dbMode = 'memory';

async function initDatabase() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    console.warn('Database credentials are not configured. Running in demo memory mode.');
    return false;
  }

  try {
    pool = mysql.createPool({
      host,
      user,
      password: process.env.DB_PASS || '',
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await pool.query('SELECT 1');
    dbMode = 'mysql';
    console.log('Connected to MySQL database.');
    return true;
  } catch (error) {
    console.warn('MySQL unavailable. Falling back to in-memory demo data.', error.message);
    pool = null;
    dbMode = 'memory';
    return false;
  }
}

module.exports = {
  initDatabase,
  getDbMode: () => dbMode,
  pool,
};
