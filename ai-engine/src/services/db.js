const mysql = require('mysql2/promise');

/**
 * Pool de conexiones MariaDB optimizado para bajo consumo de recursos en el VPS.
 */
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`${key} no configurada`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 3, // Límite bajo para ahorrar memoria RAM y recursos en MariaDB
  queueLimit: 0
});

module.exports = pool;
