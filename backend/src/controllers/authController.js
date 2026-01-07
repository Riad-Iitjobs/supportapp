const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { hashPassword, comparePassword } = require('../utils/passwordHash');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { isValidEmail, isValidPassword, sanitizeString, isRequired } = require('../utils/validation');
const userModel = require('../models/userModel');
const adminModel = require('../models/adminModel');
const constants = require('../config/constants');

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
function generateInitials(name) {
  if (!name) return 'U';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm
  });
}

/**
 * User signup
 * POST /api/auth/signup
 */
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!isRequired(name)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Name is required')
      );
    }

    if (!isRequired(email)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Email is required')
      );
    }

    if (!isRequired(password)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Password is required')
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Invalid email format')
      );
    }

    // Validate password length
    if (!isValidPassword(password)) {
      return res.status(400).json(
        errorResponse(
          'VALIDATION_ERROR',
          `Password must be between ${constants.MIN_PASSWORD_LENGTH} and ${constants.MAX_PASSWORD_LENGTH} characters`
        )
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Check if email already exists
    const existingUser = await userModel.findUserByEmail(sanitizedEmail);
    if (existingUser) {
      return res.status(409).json(
        errorResponse('DUPLICATE_ENTRY', constants.MESSAGES.EMAIL_EXISTS)
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate initials
    const initials = generateInitials(sanitizedName);

    // Create user
    const user = await userModel.createUser({
      name: sanitizedName,
      email: sanitizedEmail,
      password_hash,
      initials
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: 'user'
    });

    // Return success response
    res.status(201).json(
      successResponse(
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            initials: user.initials
          }
        },
        constants.MESSAGES.SIGNUP_SUCCESS
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * User login
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!isRequired(email)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Email is required')
      );
    }

    if (!isRequired(password)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Password is required')
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Invalid email format')
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Find user by email
    const user = await userModel.findUserByEmail(sanitizedEmail);
    if (!user) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', constants.MESSAGES.INVALID_CREDENTIALS)
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', constants.MESSAGES.INVALID_CREDENTIALS)
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: 'user'
    });

    // Return success response
    res.status(200).json(
      successResponse(
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            initials: user.initials
          }
        },
        constants.MESSAGES.LOGIN_SUCCESS
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Admin login
 * POST /api/auth/admin/login
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!isRequired(email)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Email is required')
      );
    }

    if (!isRequired(password)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Password is required')
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Invalid email format')
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Find admin by email
    const admin = await adminModel.findAdminByEmail(sanitizedEmail);
    if (!admin) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', constants.MESSAGES.INVALID_CREDENTIALS)
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', constants.MESSAGES.INVALID_CREDENTIALS)
      );
    }

    // Update last login time
    await adminModel.updateLastLogin(admin.id);

    // Generate JWT token with admin type
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
      type: 'admin'
    });

    // Return success response
    res.status(200).json(
      successResponse(
        {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name
          }
        },
        constants.MESSAGES.LOGIN_SUCCESS
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh token
 * POST /api/auth/refresh
 * (Optional - for extending token expiration)
 */
async function refreshToken(req, res, next) {
  try {
    // User is already authenticated (from middleware)
    const { userId, adminId, email, type } = req.user;

    // Generate new token
    const token = generateToken({
      userId,
      adminId,
      email,
      type
    });

    res.status(200).json(
      successResponse({ token })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  adminLogin,
  refreshToken
};
