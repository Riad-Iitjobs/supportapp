const { pool } = require('../config/database');

/**
 * Create a new user
 * @param {Object} userData - User data (name, email, password_hash, initials)
 * @returns {Promise<Object>} Created user object
 */
async function createUser(userData) {
  const { name, email, password_hash, initials } = userData;

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, initials, status)
     VALUES (?, ?, ?, ?, 'active')`,
    [name, email, password_hash, initials]
  );

  return {
    id: result.insertId,
    name,
    email,
    initials,
    status: 'active'
  };
}

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Find user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findUserById(userId) {
  const [rows] = await pool.query(
    'SELECT id, name, email, initials, status, created_at FROM users WHERE id = ?',
    [userId]
  );

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get user profile with ticket and message counts
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile with stats
 */
async function getUserProfile(userId) {
  const [userRows] = await pool.query(
    'SELECT id, name, email, initials, status, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (userRows.length === 0) {
    return null;
  }

  const user = userRows[0];

  // Get ticket count
  const [ticketCount] = await pool.query(
    'SELECT COUNT(*) as count FROM tickets WHERE user_id = ?',
    [userId]
  );

  // Get message count
  const [messageCount] = await pool.query(
    'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?',
    [userId]
  );

  return {
    ...user,
    ticketCount: ticketCount[0].count,
    messageCount: messageCount[0].count
  };
}

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user object
 */
async function updateUser(userId, updates) {
  const allowedFields = ['name', 'email'];
  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(userId);

  await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return findUserById(userId);
}

/**
 * Get all users (for admin)
 * @returns {Promise<Array>} Array of users with ticket counts
 */
async function getAllUsers() {
  const [rows] = await pool.query(
    `SELECT
      u.id,
      u.name,
      u.email,
      u.initials,
      u.status,
      u.created_at,
      COUNT(t.id) as ticketCount
     FROM users u
     LEFT JOIN tickets t ON u.id = t.user_id
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );

  return rows;
}

/**
 * Check if email exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
async function emailExists(email) {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  return rows.length > 0;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getUserProfile,
  updateUser,
  getAllUsers,
  emailExists
};
