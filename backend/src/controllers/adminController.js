const adminModel = require('../models/adminModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Admin Controller
 * Handles admin dashboard and management operations
 */

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
async function getDashboardStats(req, res, next) {
  try {
    const stats = await adminModel.getDashboardStats();

    res.status(200).json(successResponse(stats, 'Dashboard stats retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get all tickets from all users
 * GET /api/admin/tickets
 * Query params: status, priority, category, search, limit, offset
 */
async function getAllTickets(req, res, next) {
  try {
    const { status, priority, category, search, limit, offset } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (search) filters.search = search;

    const pagination = {};
    if (limit) pagination.limit = parseInt(limit);
    if (offset) pagination.offset = parseInt(offset);

    const result = await adminModel.getAllTickets(filters, pagination);

    res.status(200).json(successResponse(result, 'Tickets retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific ticket by ID
 * GET /api/admin/tickets/:id
 */
async function getTicketById(req, res, next) {
  try {
    const ticketId = parseInt(req.params.id);

    if (isNaN(ticketId)) {
      return res.status(400).json(errorResponse('INVALID_ID', 'Invalid ticket ID'));
    }

    const ticket = await adminModel.getTicketById(ticketId);

    if (!ticket) {
      return res.status(404).json(errorResponse('NOT_FOUND', 'Ticket not found'));
    }

    res.status(200).json(successResponse({ ticket }, 'Ticket retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Update ticket status
 * PUT /api/admin/tickets/:id/status
 * Body: { status }
 */
async function updateTicketStatus(req, res, next) {
  try {
    const ticketId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(ticketId)) {
      return res.status(400).json(errorResponse('INVALID_ID', 'Invalid ticket ID'));
    }

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json(
        errorResponse('INVALID_STATUS', `Status must be one of: ${validStatuses.join(', ')}`)
      );
    }

    const ticket = await adminModel.updateTicketStatus(ticketId, status);

    if (!ticket) {
      return res.status(404).json(errorResponse('NOT_FOUND', 'Ticket not found'));
    }

    res.status(200).json(successResponse({ ticket }, 'Ticket status updated successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get all users with statistics
 * GET /api/admin/users
 * Query params: limit, offset
 */
async function getAllUsers(req, res, next) {
  try {
    const { limit, offset } = req.query;

    const pagination = {};
    if (limit) pagination.limit = parseInt(limit);
    if (offset) pagination.offset = parseInt(offset);

    const result = await adminModel.getAllUsers(pagination);

    res.status(200).json(successResponse(result, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Update user status
 * PUT /api/admin/users/:id/status
 * Body: { status }
 */
async function updateUserStatus(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json(errorResponse('INVALID_ID', 'Invalid user ID'));
    }

    // Validate status
    const validStatuses = ['active', 'pending', 'inactive'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json(
        errorResponse('INVALID_STATUS', `Status must be one of: ${validStatuses.join(', ')}`)
      );
    }

    const user = await adminModel.updateUserStatus(userId, status);

    if (!user) {
      return res.status(404).json(errorResponse('NOT_FOUND', 'User not found'));
    }

    res.status(200).json(successResponse({ user }, 'User status updated successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get all chat threads
 * GET /api/admin/chats
 */
async function getAllChatThreads(req, res, next) {
  try {
    const threads = await adminModel.getAllChatThreads();

    res.status(200).json(successResponse({ threads }, 'Chat threads retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get chat history for specific user
 * GET /api/admin/chats/:userId
 */
async function getChatByUserId(req, res, next) {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json(errorResponse('INVALID_ID', 'Invalid user ID'));
    }

    const messages = await adminModel.getChatByUserId(userId);

    res.status(200).json(successResponse({ messages }, 'Chat history retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  getAllUsers,
  updateUserStatus,
  getAllChatThreads,
  getChatByUserId
};
