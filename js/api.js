/**
 * API Client
 * Handles all API requests to the backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Make HTTP request to API
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // Add authorization token if available
  const token = getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new Error(data.error?.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== Authentication APIs ====================

/**
 * User signup
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} { token, user }
 */
async function signup(userData) {
  const response = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return response.data;
}

/**
 * User login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { token, user }
 */
async function loginUser(credentials) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return response.data;
}

/**
 * Admin login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { token, admin }
 */
async function loginAdmin(credentials) {
  const response = await apiRequest('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return response.data;
}

/**
 * Refresh token
 * @returns {Promise<Object>} { token }
 */
async function refreshToken() {
  const response = await apiRequest('/auth/refresh', {
    method: 'POST'
  });
  return response.data;
}

// ==================== User APIs ====================

/**
 * Get user profile
 * @returns {Promise<Object>} User profile
 */
async function getUserProfile() {
  const response = await apiRequest('/user/profile', {
    method: 'GET'
  });
  return response.data;
}

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated user
 */
async function updateUserProfile(updates) {
  const response = await apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  return response.data;
}

// ==================== Ticket APIs ====================

/**
 * Create ticket
 * @param {Object} ticketData - Ticket information
 * @returns {Promise<Object>} Created ticket
 */
async function createTicket(ticketData) {
  const response = await apiRequest('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData)
  });
  return response.data;
}

/**
 * Get all tickets for current user
 * @param {Object} filters - Optional filters { status, category, priority }
 * @returns {Promise<Array>} Array of tickets
 */
async function getTickets(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.priority) queryParams.append('priority', filters.priority);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/tickets?${queryString}` : '/tickets';

  const response = await apiRequest(endpoint, {
    method: 'GET'
  });
  return response.data;
}

/**
 * Get ticket by ID
 * @param {number} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket details
 */
async function getTicketById(ticketId) {
  const response = await apiRequest(`/tickets/${ticketId}`, {
    method: 'GET'
  });
  return response.data;
}

/**
 * Update ticket
 * @param {number} ticketId - Ticket ID
 * @param {Object} updates - Ticket updates
 * @returns {Promise<Object>} Updated ticket
 */
async function updateTicket(ticketId, updates) {
  const response = await apiRequest(`/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  return response.data;
}

/**
 * Delete ticket
 * @param {number} ticketId - Ticket ID
 * @returns {Promise<Object>} Success message
 */
async function deleteTicket(ticketId) {
  const response = await apiRequest(`/tickets/${ticketId}`, {
    method: 'DELETE'
  });
  return response.data;
}

/**
 * Get ticket statistics
 * @returns {Promise<Object>} Ticket stats
 */
async function getTicketStats() {
  const response = await apiRequest('/tickets/stats', {
    method: 'GET'
  });
  return response.data;
}

// ==================== Chat APIs ====================

/**
 * Send chat message
 * @param {string} message - Message text
 * @returns {Promise<Object>} { userMessage, botResponse }
 */
async function sendChatMessage(message) {
  const response = await apiRequest('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  return response.data;
}

/**
 * Get chat history
 * @returns {Promise<Array>} Array of messages
 */
async function getChatMessages() {
  const response = await apiRequest('/chat/messages', {
    method: 'GET'
  });
  return response.data;
}

/**
 * Poll for new messages since timestamp
 * @param {string} since - ISO timestamp
 * @returns {Promise<Array>} New messages
 */
async function pollChatMessages(since) {
  const response = await apiRequest(`/chat/poll?since=${since}`, {
    method: 'GET'
  });
  return response.data;
}

/**
 * Delete chat history
 * @returns {Promise<Object>} Success message
 */
async function deleteChatHistory() {
  const response = await apiRequest('/chat/messages', {
    method: 'DELETE'
  });
  return response.data;
}

// ==================== Admin APIs ====================

/**
 * Get admin dashboard stats
 * @returns {Promise<Object>} Dashboard statistics
 */
async function getAdminDashboardStats() {
  const response = await apiRequest('/admin/dashboard/stats', {
    method: 'GET'
  });
  return response.data;
}

/**
 * Get all tickets (admin)
 * @param {Object} filters - { status, priority, category, search, limit, offset }
 * @returns {Promise<Object>} { tickets, total }
 */
async function getAdminTickets(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.priority) queryParams.append('priority', filters.priority);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.offset) queryParams.append('offset', filters.offset);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/admin/tickets?${queryString}` : '/admin/tickets';

  const response = await apiRequest(endpoint, {
    method: 'GET'
  });
  return response.data;
}

/**
 * Get ticket by ID (admin)
 * @param {number} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket with user info
 */
async function getAdminTicketById(ticketId) {
  const response = await apiRequest(`/admin/tickets/${ticketId}`, {
    method: 'GET'
  });
  return response.data;
}

/**
 * Update ticket status (admin)
 * @param {number} ticketId - Ticket ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated ticket
 */
async function updateAdminTicketStatus(ticketId, status) {
  const response = await apiRequest(`/admin/tickets/${ticketId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return response.data;
}

/**
 * Get all users (admin)
 * @param {Object} pagination - { limit, offset }
 * @returns {Promise<Object>} { users, total }
 */
async function getAdminUsers(pagination = {}) {
  const queryParams = new URLSearchParams();
  if (pagination.limit) queryParams.append('limit', pagination.limit);
  if (pagination.offset) queryParams.append('offset', pagination.offset);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';

  const response = await apiRequest(endpoint, {
    method: 'GET'
  });
  return response.data;
}

/**
 * Update user status (admin)
 * @param {number} userId - User ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated user
 */
async function updateAdminUserStatus(userId, status) {
  const response = await apiRequest(`/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return response.data;
}

/**
 * Get all chat threads (admin)
 * @returns {Promise<Array>} Array of chat threads
 */
async function getAdminChatThreads() {
  const response = await apiRequest('/admin/chats', {
    method: 'GET'
  });
  return response.data;
}

/**
 * Get chat by user ID (admin)
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of messages
 */
async function getAdminChatByUserId(userId) {
  const response = await apiRequest(`/admin/chats/${userId}`, {
    method: 'GET'
  });
  return response.data;
}

// ==================== Health Check ====================

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
async function checkHealth() {
  const response = await fetch('http://localhost:3000/health');
  return response.json();
}
