const mysql = require('mysql2/promise');

/**
 * Pool de conexiones MariaDB optimizado para bajo consumo de recursos en el VPS.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'cesa_admin',
  password: process.env.DB_PASS || 'cesa_pw_20ff8077e040',
  database: process.env.DB_NAME || 'cesa_web',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 3, // Límite bajo para ahorrar memoria RAM y recursos en MariaDB
  queueLimit: 0
});

module.exports = pool;
