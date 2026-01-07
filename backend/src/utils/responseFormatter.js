/**
 * Format successful API response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response
 */
function successResponse(data, message = '') {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * Format error API response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {*} details - Optional error details
 * @returns {Object} Formatted error response
 */
function errorResponse(code, message, details = null) {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}

/**
 * Format pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
function paginationMeta(page, limit, total) {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  successResponse,
  errorResponse,
  paginationMeta
};
