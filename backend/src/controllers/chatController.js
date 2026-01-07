const chatModel = require('../models/chatModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { sanitizeString, isRequired } = require('../utils/validation');
const constants = require('../config/constants');

/**
 * Bot response patterns (same as frontend chat-widget.js)
 */
const botResponses = {
  greetings: [
    "Hi there! How can I assist you today?",
    "Hello! What can I help you with?",
    "Hey! I'm here to help. What's on your mind?"
  ],
  help: [
    "I can help you with:\n• Submitting support tickets\n• Account issues\n• Technical questions\n• Billing inquiries\n\nWhat would you like help with?"
  ],
  ticket: [
    "I can help you create a support ticket! Would you like to go to the ticket submission page, or would you prefer to describe your issue here first?"
  ],
  billing: [
    "For billing questions, I recommend creating a ticket through our ticket system. This ensures your inquiry is handled by our billing team securely."
  ],
  technical: [
    "I'd be happy to help with technical issues! Can you describe the problem you're experiencing in more detail?"
  ],
  account: [
    "For account-related questions, please visit the Account page or create a support ticket for personalized assistance."
  ],
  default: [
    "I understand. Let me help you with that. Could you provide more details?",
    "Thanks for reaching out! Can you tell me more about what you need?",
    "I'm here to help! Could you elaborate on your question?"
  ]
};

/**
 * Generate bot response based on user message
 * @param {string} userMessage - User's message
 * @returns {string} Bot response
 */
function generateBotResponse(userMessage) {
  const message = userMessage.toLowerCase();

  if (message.match(/\b(hi|hello|hey|greetings)\b/)) {
    return botResponses.greetings[Math.floor(Math.random() * botResponses.greetings.length)];
  } else if (message.match(/\b(help|support)\b/)) {
    return botResponses.help[0];
  } else if (message.match(/\b(ticket|issue|problem)\b/)) {
    return botResponses.ticket[0];
  } else if (message.match(/\b(billing|payment|invoice|charge)\b/)) {
    return botResponses.billing[0];
  } else if (message.match(/\b(technical|bug|error|broken)\b/)) {
    return botResponses.technical[0];
  } else if (message.match(/\b(account|login|password|profile)\b/)) {
    return botResponses.account[0];
  } else {
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  }
}

/**
 * Get all chat messages for the logged-in user
 * GET /api/chat/messages
 */
async function getMessages(req, res, next) {
  try {
    const userId = req.user.userId;

    const messages = await chatModel.getMessagesByUserId(userId);

    res.status(200).json(
      successResponse({ messages, total: messages.length })
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Send a chat message (creates user message + bot response)
 * POST /api/chat/messages
 */
async function sendMessage(req, res, next) {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    // Validate message
    if (!isRequired(message)) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Message is required')
      );
    }

    const sanitizedMessage = sanitizeString(message);

    if (sanitizedMessage.length === 0) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Message cannot be empty')
      );
    }

    // Create user message
    const userMessage = await chatModel.createMessage(userId, sanitizedMessage, true);

    // Generate and create bot response
    const botResponseText = generateBotResponse(sanitizedMessage);

    // Small delay to simulate thinking (optional)
    await new Promise(resolve => setTimeout(resolve, 500));

    const botMessage = await chatModel.createMessage(userId, botResponseText, false);

    res.status(201).json(
      successResponse(
        {
          userMessage,
          botResponse: botMessage
        },
        constants.MESSAGES.MESSAGE_SENT
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Poll for new messages since a timestamp (for real-time-like experience)
 * GET /api/chat/poll?since=timestamp
 */
async function pollMessages(req, res, next) {
  try {
    const userId = req.user.userId;
    const { since } = req.query;

    if (!since) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Since timestamp is required')
      );
    }

    // Get messages since timestamp
    const newMessages = await chatModel.getMessagesSince(userId, since);

    res.status(200).json(
      successResponse({
        newMessages,
        hasMore: newMessages.length > 0
      })
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Delete all chat messages for the user
 * DELETE /api/chat/messages
 */
async function deleteMessages(req, res, next) {
  try {
    const userId = req.user.userId;

    const deleted = await chatModel.deleteUserMessages(userId);

    res.status(200).json(
      successResponse(
        { deleted },
        deleted ? 'Chat history deleted successfully' : 'No messages to delete'
      )
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMessages,
  sendMessage,
  pollMessages,
  deleteMessages
};
