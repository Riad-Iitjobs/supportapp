const ticketModel = require('../models/ticketModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { isValidCategory, isValidPriority, sanitizeString, isRequired } = require('../utils/validation');
const constants = require('../config/constants');

/**
 * Create a new ticket
 * POST /api/tickets
 */
async function createTicket(req, res, next) {
  try {
    const { subject, category, priority, description, phone } = req.body;
    const userId = req.user.userId; // From JWT token
    const email = req.user.email;   // From JWT token

    // Validate required fields
    if (!isRequired(subject)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Subject is required')
      );
    }

    if (!isRequired(category)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Category is required')
      );
    }

    if (!isRequired(priority)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Priority is required')
      );
    }

    // Validate category
    if (!isValidCategory(category)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', `Category must be one of: ${constants.TICKET_CATEGORIES.join(', ')}`)
      );
    }

    // Validate priority
    if (!isValidPriority(priority)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', `Priority must be one of: ${constants.TICKET_PRIORITIES.join(', ')}`)
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      userId,
      subject: sanitizeString(subject),
      category: sanitizeString(category),
      priority: sanitizeString(priority),
      description: sanitizeString(description) || null,
      email,
      phone: sanitizeString(phone) || null
    };

    // Create ticket
    const ticket = await ticketModel.createTicket(sanitizedData);

    res.status(201).json(
      successResponse(ticket, constants.MESSAGES.TICKET_CREATED)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get all tickets for the logged-in user
 * GET /api/tickets
 */
async function getTickets(req, res, next) {
  try {
    const userId = req.user.userId;
    const { status, category, priority } = req.query;

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;

    // Get tickets
    const tickets = await ticketModel.getTicketsByUserId(userId, filters);

    res.status(200).json(
      successResponse({ tickets, total: tickets.length })
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific ticket by ID
 * GET /api/tickets/:id
 */
async function getTicketById(req, res, next) {
  try {
    const ticketId = req.params.id;
    const userId = req.user.userId;

    // Get ticket (verifies ownership)
    const ticket = await ticketModel.getTicketById(ticketId, userId);

    if (!ticket) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', constants.MESSAGES.NOT_FOUND)
      );
    }

    res.status(200).json(
      successResponse(ticket)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Update a ticket
 * PUT /api/tickets/:id
 */
async function updateTicket(req, res, next) {
  try {
    const ticketId = req.params.id;
    const userId = req.user.userId;
    const { description, phone } = req.body;

    // Users can only update description and phone
    const updates = {};
    if (description !== undefined) updates.description = sanitizeString(description);
    if (phone !== undefined) updates.phone = sanitizeString(phone);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'No valid fields to update')
      );
    }

    // Update ticket
    const ticket = await ticketModel.updateTicket(ticketId, userId, updates);

    if (!ticket) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', constants.MESSAGES.NOT_FOUND)
      );
    }

    res.status(200).json(
      successResponse(ticket, constants.MESSAGES.TICKET_UPDATED)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a ticket
 * DELETE /api/tickets/:id
 */
async function deleteTicket(req, res, next) {
  try {
    const ticketId = req.params.id;
    const userId = req.user.userId;

    const deleted = await ticketModel.deleteTicket(ticketId, userId);

    if (!deleted) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', constants.MESSAGES.NOT_FOUND)
      );
    }

    res.status(200).json(
      successResponse({ id: ticketId }, 'Ticket deleted successfully')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get ticket statistics for the user
 * GET /api/tickets/stats
 */
async function getTicketStats(req, res, next) {
  try {
    const userId = req.user.userId;

    const stats = await ticketModel.getTicketStats(userId);

    res.status(200).json(
      successResponse(stats)
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats
};
