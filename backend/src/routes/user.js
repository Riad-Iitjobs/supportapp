const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile with statistics
 * @access  Protected
 */
router.get('/profile', userController.getUserProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile (name, email)
 * @access  Protected
 */
router.put('/profile', userController.updateUserProfile);

module.exports = router;
