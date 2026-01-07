const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middleware/auth');

// All chat routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/chat/messages
 * @desc    Get all chat messages for the logged-in user
 * @access  Protected
 */
router.get('/messages', chatController.getMessages);

/**
 * @route   POST /api/chat/messages
 * @desc    Send a chat message (creates user message + bot response)
 * @access  Protected
 */
router.post('/messages', chatController.sendMessage);

/**
 * @route   GET /api/chat/poll
 * @desc    Poll for new messages since a timestamp
 * @access  Protected
 * @query   since (ISO timestamp)
 */
router.get('/poll', chatController.pollMessages);

/**
 * @route   DELETE /api/chat/messages
 * @desc    Delete all chat messages for the user
 * @access  Protected
 */
router.delete('/messages', chatController.deleteMessages);

module.exports = router;
