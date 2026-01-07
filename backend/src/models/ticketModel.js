const { pool } = require('../config/database');

/**
 * Create a new ticket
 * @param {Object} ticketData - Ticket data
 * @returns {Promise<Object>} Created ticket
 */
async function createTicket(ticketData) {
  const { userId, subject, category, priority, description, email, phone } = ticketData;

  const [result] = await pool.query(
    `INSERT INTO tickets (user_id, subject, category, priority, description, email, phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
    [userId, subject, category, priority, description, email, phone]
  );

  return {
    id: result.insertId,
    userId,
    subject,
    category,
    priority,
    description,
    email,
    phone,
    status: 'open',
    createdAt: new Date().toISOString()
  };
}

/**
 * Get all tickets for a specific user
 * @param {number} userId - User ID
 * @param {Object} filters - Optional filters (status, category, priority)
 * @returns {Promise<Array>} Array of tickets
 */
async function getTicketsByUserId(userId, filters = {}) {
  let query = 'SELECT * FROM tickets WHERE user_id = ?';
  const params = [userId];

  // Add status filter
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  // Add category filter
  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  // Add priority filter
  if (filters.priority) {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }

  // Sort by newest first
  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * Get a specific ticket by ID
 * @param {number} ticketId - Ticket ID
 * @param {number} userId - User ID (to verify ownership)
 * @returns {Promise<Object|null>} Ticket or null if not found
 */
async function getTicketById(ticketId, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM tickets WHERE id = ? AND user_id = ?',
    [ticketId, userId]
  );

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Update a ticket (user can only update description and phone)
 * @param {number} ticketId - Ticket ID
 * @param {number} userId - User ID (to verify ownership)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated ticket or null
 */
async function updateTicket(ticketId, userId, updates) {
  // Users can only update these fields
  const allowedFields = ['description', 'phone'];
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

  values.push(ticketId, userId);

  const [result] = await pool.query(
    `UPDATE tickets SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getTicketById(ticketId, userId);
}

/**
 * Delete a ticket
 * @param {number} ticketId - Ticket ID
 * @param {number} userId - User ID (to verify ownership)
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteTicket(ticketId, userId) {
  const [result] = await pool.query(
    'DELETE FROM tickets WHERE id = ? AND user_id = ?',
    [ticketId, userId]
  );

  return result.affectedRows > 0;
}

/**
 * Get ticket statistics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Ticket stats
 */
async function getTicketStats(userId) {
  const [rows] = await pool.query(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
      SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgress,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
     FROM tickets
     WHERE user_id = ?`,
    [userId]
  );

  return rows[0];
}

module.exports = {
  createTicket,
  getTicketsByUserId,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats
};
