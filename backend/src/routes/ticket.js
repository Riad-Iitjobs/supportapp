const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticateToken = require('../middleware/auth');

// All ticket routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/tickets/stats
 * @desc    Get ticket statistics for the user
 * @access  Protected
 */
router.get('/stats', ticketController.getTicketStats);

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets for the logged-in user
 * @access  Protected
 * @query   status, category, priority (optional filters)
 */
router.get('/', ticketController.getTickets);

/**
 * @route   POST /api/tickets
 * @desc    Create a new ticket
 * @access  Protected
 */
router.post('/', ticketController.createTicket);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get a specific ticket by ID
 * @access  Protected (user can only access their own tickets)
 */
router.get('/:id', ticketController.getTicketById);

/**
 * @route   PUT /api/tickets/:id
 * @desc    Update a ticket (description and phone only)
 * @access  Protected (user can only update their own tickets)
 */
router.put('/:id', ticketController.updateTicket);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Delete a ticket
 * @access  Protected (user can only delete their own tickets)
 */
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
