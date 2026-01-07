const { pool } = require('../config/database');

/**
 * Find admin by email
 * @param {string} email - Admin email
 * @returns {Promise<Object|null>} Admin object or null if not found
 */
async function findAdminByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM admin_users WHERE email = ?',
    [email]
  );

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Find admin by ID
 * @param {number} adminId - Admin ID
 * @returns {Promise<Object|null>} Admin object or null if not found
 */
async function findAdminById(adminId) {
  const [rows] = await pool.query(
    'SELECT id, email, name, created_at FROM admin_users WHERE id = ?',
    [adminId]
  );

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Update admin last login time
 * @param {number} adminId - Admin ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(adminId) {
  await pool.query(
    'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
    [adminId]
  );
}

/**
 * Create a new admin user
 * @param {Object} adminData - Admin data (email, password_hash, name)
 * @returns {Promise<Object>} Created admin object
 */
async function createAdmin(adminData) {
  const { email, password_hash, name } = adminData;

  const [result] = await pool.query(
    'INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)',
    [email, password_hash, name]
  );

  return {
    id: result.insertId,
    email,
    name
  };
}

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Stats including ticket counts, user count, etc.
 */
async function getDashboardStats() {
  try {
    // Get ticket counts by status
    const [ticketStats] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM tickets
    `);

    // Get ticket counts by priority
    const [priorityStats] = await pool.query(`
      SELECT
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent
      FROM tickets
    `);

    // Get ticket counts by category
    const [categoryStats] = await pool.query(`
      SELECT
        SUM(CASE WHEN category = 'technical' THEN 1 ELSE 0 END) as technical,
        SUM(CASE WHEN category = 'billing' THEN 1 ELSE 0 END) as billing,
        SUM(CASE WHEN category = 'feature' THEN 1 ELSE 0 END) as feature,
        SUM(CASE WHEN category = 'bug' THEN 1 ELSE 0 END) as bug,
        SUM(CASE WHEN category = 'other' THEN 1 ELSE 0 END) as other
      FROM tickets
    `);

    // Get user count
    const [userCount] = await pool.query(`
      SELECT COUNT(*) as total FROM users
    `);

    // Get recent tickets (last 7 days)
    const [recentTickets] = await pool.query(`
      SELECT COUNT(*) as count
      FROM tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    return {
      tickets: ticketStats[0],
      priority: priorityStats[0],
      category: categoryStats[0],
      users: userCount[0].total,
      recentTickets: recentTickets[0].count
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get all tickets from all users with optional filters
 * @param {Object} filters - Optional filters (status, priority, category, search)
 * @param {Object} pagination - { limit, offset }
 * @returns {Promise<Object>} Object with tickets array and total count
 */
async function getAllTickets(filters = {}, pagination = {}) {
  try {
    let query = `
      SELECT
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }

    if (filters.category) {
      query += ' AND t.category = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      query += ' AND (t.subject LIKE ? OR t.description LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add ordering
    query += ' ORDER BY t.created_at DESC';

    // Add pagination
    if (pagination.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(pagination.limit));
    }

    if (pagination.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(pagination.offset));
    }

    const [rows] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM tickets t LEFT JOIN users u ON t.user_id = u.id WHERE 1=1';
    const countParams = [];

    if (filters.status) {
      countQuery += ' AND t.status = ?';
      countParams.push(filters.status);
    }

    if (filters.priority) {
      countQuery += ' AND t.priority = ?';
      countParams.push(filters.priority);
    }

    if (filters.category) {
      countQuery += ' AND t.category = ?';
      countParams.push(filters.category);
    }

    if (filters.search) {
      countQuery += ' AND (t.subject LIKE ? OR t.description LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    return {
      tickets: rows,
      total: countResult[0].total
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get all users with their ticket statistics
 * @param {Object} pagination - { limit, offset }
 * @returns {Promise<Object>} Object with users array and total count
 */
async function getAllUsers(pagination = {}) {
  try {
    let query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.initials,
        u.status,
        u.created_at,
        COUNT(t.id) as total_tickets,
        SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN t.status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END) as closed_tickets
      FROM users u
      LEFT JOIN tickets t ON u.id = t.user_id
      GROUP BY u.id, u.name, u.email, u.initials, u.status, u.created_at
      ORDER BY u.created_at DESC
    `;
    const params = [];

    // Add pagination
    if (pagination.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(pagination.limit));
    }

    if (pagination.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(pagination.offset));
    }

    const [rows] = await pool.query(query, params);

    // Get total user count
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');

    return {
      users: rows,
      total: countResult[0].total
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get all chat threads with latest message info
 * @returns {Promise<Array>} Array of chat threads
 */
async function getAllChatThreads() {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        COUNT(cm.id) as message_count,
        MAX(cm.created_at) as last_message_at,
        (SELECT message FROM chat_messages
         WHERE user_id = u.id
         ORDER BY created_at DESC LIMIT 1) as last_message
      FROM users u
      LEFT JOIN chat_messages cm ON u.id = cm.user_id
      GROUP BY u.id, u.name, u.email
      HAVING message_count > 0
      ORDER BY last_message_at DESC
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

/**
 * Get full chat history for a specific user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of chat messages
 */
async function getChatByUserId(userId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        cm.*,
        u.name as user_name,
        u.email as user_email
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.user_id = ?
      ORDER BY cm.created_at ASC
    `, [userId]);

    return rows;
  } catch (error) {
    throw error;
  }
}

/**
 * Update ticket status (admin can update any ticket)
 * @param {number} ticketId - Ticket ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} Updated ticket info or null if not found
 */
async function updateTicketStatus(ticketId, status) {
  try {
    const [result] = await pool.query(
      'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, ticketId]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    // Get updated ticket
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE id = ?',
      [ticketId]
    );

    return rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Get ticket by ID (admin can view any ticket)
 * @param {number} ticketId - Ticket ID
 * @returns {Promise<Object|null>} Ticket with user info or null if not found
 */
async function getTicketById(ticketId) {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [ticketId]);

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Update user status (activate/deactivate)
 * @param {number} userId - User ID
 * @param {string} status - New status (active, pending, inactive)
 * @returns {Promise<Object|null>} Updated user info or null if not found
 */
async function updateUserStatus(userId, status) {
  try {
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    // Get updated user
    const [rows] = await pool.query(
      'SELECT id, name, email, initials, status, created_at FROM users WHERE id = ?',
      [userId]
    );

    return rows[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  findAdminByEmail,
  findAdminById,
  updateLastLogin,
  createAdmin,
  getDashboardStats,
  getAllTickets,
  getAllUsers,
  getAllChatThreads,
  getChatByUserId,
  updateTicketStatus,
  getTicketById,
  updateUserStatus
};
