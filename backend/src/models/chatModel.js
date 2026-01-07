const { pool } = require('../config/database');

/**
 * Create a new chat message
 * @param {number} userId - User ID
 * @param {string} message - Message text
 * @param {boolean} isUserMessage - True if sent by user, false if bot
 * @returns {Promise<Object>} Created message
 */
async function createMessage(userId, message, isUserMessage) {
  const [result] = await pool.query(
    `INSERT INTO chat_messages (user_id, message, is_user_message)
     VALUES (?, ?, ?)`,
    [userId, message, isUserMessage]
  );

  return {
    id: result.insertId,
    userId,
    message,
    isUserMessage,
    createdAt: new Date().toISOString()
  };
}

/**
 * Get all chat messages for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of messages
 */
async function getMessagesByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT id, user_id as userId, message, is_user_message as isUserMessage, created_at as createdAt
     FROM chat_messages
     WHERE user_id = ?
     ORDER BY created_at ASC`,
    [userId]
  );

  return rows;
}

/**
 * Get recent messages since a specific timestamp (for polling)
 * @param {number} userId - User ID
 * @param {string} since - ISO timestamp
 * @returns {Promise<Array>} Array of new messages
 */
async function getMessagesSince(userId, since) {
  const [rows] = await pool.query(
    `SELECT id, user_id as userId, message, is_user_message as isUserMessage, created_at as createdAt
     FROM chat_messages
     WHERE user_id = ? AND created_at > ?
     ORDER BY created_at ASC`,
    [userId, since]
  );

  return rows;
}

/**
 * Get message count for a user
 * @param {number} userId - User ID
 * @returns {Promise<number>} Message count
 */
async function getMessageCount(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?',
    [userId]
  );

  return rows[0].count;
}

/**
 * Delete all messages for a user
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteUserMessages(userId) {
  const [result] = await pool.query(
    'DELETE FROM chat_messages WHERE user_id = ?',
    [userId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  createMessage,
  getMessagesByUserId,
  getMessagesSince,
  getMessageCount,
  deleteUserMessages
};
