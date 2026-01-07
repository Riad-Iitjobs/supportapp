const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const requireAdmin = require('../middleware/adminAuth');

/**
 * Admin Routes
 * All routes require admin authentication (both authenticateToken and requireAdmin)
 */

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * Dashboard
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * Ticket Management
 */
router.get('/tickets', adminController.getAllTickets);
router.get('/tickets/:id', adminController.getTicketById);
router.put('/tickets/:id/status', adminController.updateTicketStatus);

/**
 * User Management
 */
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

/**
 * Chat Management
 */
router.get('/chats', adminController.getAllChatThreads);
router.get('/chats/:userId', adminController.getChatByUserId);

module.exports = router;
