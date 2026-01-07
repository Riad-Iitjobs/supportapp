const constants = require('../config/constants');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password length
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
function isValidPassword(password) {
  return (
    password &&
    password.length >= constants.MIN_PASSWORD_LENGTH &&
    password.length <= constants.MAX_PASSWORD_LENGTH
  );
}

/**
 * Validate ticket category
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid
 */
function isValidCategory(category) {
  return constants.TICKET_CATEGORIES.includes(category);
}

/**
 * Validate ticket priority
 * @param {string} priority - Priority to validate
 * @returns {boolean} True if valid
 */
function isValidPriority(priority) {
  return constants.TICKET_PRIORITIES.includes(priority);
}

/**
 * Validate ticket status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
function isValidStatus(status) {
  return constants.TICKET_STATUSES.includes(status);
}

/**
 * Validate phone number format (optional field)
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid or empty
 */
function isValidPhone(phone) {
  if (!phone || phone.trim() === '') return true; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize string input (remove leading/trailing spaces)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  return str ? str.trim() : '';
}

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {boolean} True if value exists
 */
function isRequired(value) {
  return value !== null && value !== undefined && value !== '';
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidCategory,
  isValidPriority,
  isValidStatus,
  isValidPhone,
  sanitizeString,
  isRequired
};
