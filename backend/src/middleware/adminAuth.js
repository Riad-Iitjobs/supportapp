const { errorResponse } = require('../utils/responseFormatter');
const constants = require('../config/constants');

/**
 * Middleware to check if user has admin privileges
 * Must be used AFTER authenticateToken middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function requireAdmin(req, res, next) {
  // Check if user is authenticated and has admin type
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json(
      errorResponse('FORBIDDEN', constants.MESSAGES.FORBIDDEN)
    );
  }

  next();
}

module.exports = requireAdmin;
