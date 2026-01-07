const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Hardcoded config (matches your working setup)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'supporthub_db',
  socketPath: '/tmp/mysql.sock',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// --- FIX: Add the missing testConnection function ---
promisePool.testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Rethrow so server.js knows it failed
    throw error;
  }
};

module.exports = { pool: promisePool, testConnection: promisePool.testConnection };