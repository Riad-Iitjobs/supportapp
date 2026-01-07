const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Create the connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  // Your .env uses DB_PASSWORD
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// CRITICAL FIX: Map your specific env variable 'DB_SOCKET' to 'socketPath'
if (process.env.DB_SOCKET) {
  dbConfig.socketPath = process.env.DB_SOCKET;
}

const pool = mysql.createPool(dbConfig);

// Helper to check connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

module.exports = pool.promise();