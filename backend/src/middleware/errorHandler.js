const { errorResponse } = require('../utils/responseFormatter');
const constants = require('../config/constants');

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', err.message, err.details)
    );
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json(
      errorResponse('DUPLICATE_ENTRY', constants.MESSAGES.EMAIL_EXISTS)
    );
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json(
      errorResponse('CONSTRAINT_ERROR', 'Database constraint violation')
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json(
      errorResponse('FORBIDDEN', constants.MESSAGES.INVALID_TOKEN)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(403).json(
      errorResponse('TOKEN_EXPIRED', 'Token has expired')
    );
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json(
      errorResponse(err.code || 'ERROR', err.message)
    );
  }

  // Unknown/Internal errors
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json(
    errorResponse(
      'INTERNAL_ERROR',
      constants.MESSAGES.INTERNAL_ERROR,
      isDevelopment ? { stack: err.stack, message: err.message } : null
    )
  );
}

module.exports = errorHandler;
