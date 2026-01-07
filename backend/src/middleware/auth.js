const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { errorResponse } = require('../utils/responseFormatter');
const constants = require('../config/constants');

/**
 * Middleware to authenticate JWT token
 * Verifies the token and attaches user/admin info to req.user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function authenticateToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', constants.MESSAGES.UNAUTHORIZED)
    );
  }

  // Verify token
  jwt.verify(token, jwtConfig.secret, (err, payload) => {
    if (err) {
      return res.status(403).json(
        errorResponse('FORBIDDEN', constants.MESSAGES.INVALID_TOKEN)
      );
    }

    // Attach user info to request
    req.user = payload;
    next();
  });
}

module.exports = authenticateToken;
