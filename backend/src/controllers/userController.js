const userModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { isValidEmail, sanitizeString } = require('../utils/validation');
const constants = require('../config/constants');

/**
 * Get user profile with statistics
 * GET /api/user/profile
 */
async function getUserProfile(req, res, next) {
  try {
    const userId = req.user.userId;

    const profile = await userModel.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'User not found')
      );
    }

    // Remove sensitive fields before sending
    delete profile.password_hash;

    res.status(200).json(
      successResponse(profile)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/user/profile
 */
async function updateUserProfile(req, res, next) {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    const updates = {};

    // Validate and add name if provided
    if (name !== undefined) {
      const sanitizedName = sanitizeString(name);
      if (sanitizedName.length === 0) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', 'Name cannot be empty')
        );
      }
      updates.name = sanitizedName;
    }

    // Validate and add email if provided
    if (email !== undefined) {
      const sanitizedEmail = sanitizeString(email).toLowerCase();
      if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', 'Invalid email format')
        );
      }

      // Check if email is already taken by another user
      const existingUser = await userModel.findUserByEmail(sanitizedEmail);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json(
          errorResponse('DUPLICATE_ENTRY', constants.MESSAGES.EMAIL_EXISTS)
        );
      }

      updates.email = sanitizedEmail;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'No valid fields to update')
      );
    }

    // Update profile
    const updatedUser = await userModel.updateUser(userId, updates);

    // Remove sensitive fields
    delete updatedUser.password_hash;

    res.status(200).json(
      successResponse(updatedUser, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile
};
