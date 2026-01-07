// Application constants

module.exports = {
  // Ticket categories
  TICKET_CATEGORIES: ['technical', 'billing', 'feature', 'bug', 'other'],

  // Ticket priorities
  TICKET_PRIORITIES: ['low', 'medium', 'high', 'urgent'],

  // Ticket statuses
  TICKET_STATUSES: ['open', 'in-progress', 'resolved', 'closed'],

  // User statuses
  USER_STATUSES: ['active', 'pending', 'inactive'],

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Password validation
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Auth rate limiting (stricter for login/signup)
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX_REQUESTS: 10,

  // Response messages
  MESSAGES: {
    LOGIN_SUCCESS: 'Login successful',
    SIGNUP_SUCCESS: 'Account created successfully',
    TICKET_CREATED: 'Ticket created successfully',
    TICKET_UPDATED: 'Ticket updated successfully',
    MESSAGE_SENT: 'Message sent successfully',
    UNAUTHORIZED: 'Access token required',
    INVALID_TOKEN: 'Invalid or expired token',
    FORBIDDEN: 'Insufficient permissions',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'An unexpected error occurred',
    EMAIL_EXISTS: 'Email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password'
  }
};
