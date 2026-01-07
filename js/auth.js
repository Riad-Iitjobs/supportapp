/**
 * Authentication Utilities
 * Handles JWT token management and user authentication state
 */

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

/**
 * Store authentication token in localStorage
 * @param {string} token - JWT token
 */
function setToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

/**
 * Get stored authentication token
 * @returns {string|null} JWT token or null if not found
 */
function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Remove authentication token from storage
 */
function removeToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Store user data in localStorage
 * @param {Object} user - User object
 */
function setUser(user) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

/**
 * Get stored user data
 * @returns {Object|null} User object or null if not found
 */
function getUser() {
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function decodeToken(token) {
  if (!token) return null;

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url payload
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is authenticated
 */
function isLoggedIn() {
  const token = getToken();
  if (!token) return false;

  // Check if token is expired
  if (isTokenExpired(token)) {
    removeToken();
    return false;
  }

  return true;
}

/**
 * Get current user from token
 * @returns {Object|null} User data from token or null if not logged in
 */
function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  // Get stored user data for full profile
  const storedUser = getUser();
  if (storedUser) {
    return storedUser;
  }

  // Fallback to token data
  return {
    id: decoded.userId,
    email: decoded.email,
    type: decoded.type
  };
}

/**
 * Check if current user is admin
 * @returns {boolean} True if user is admin
 */
function isAdmin() {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  return decoded && decoded.type === 'admin';
}

/**
 * Login user with token and user data
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
function login(token, user) {
  setToken(token);
  setUser(user);
}

/**
 * Logout user
 */
function logout() {
  removeToken();
}

/**
 * Redirect to login page if not authenticated
 * @param {string} redirectUrl - URL to redirect to after login
 */
function requireAuth(redirectUrl = '/login.html') {
  if (!isLoggedIn()) {
    // Store current page for redirect after login
    const currentPage = window.location.pathname;
    if (currentPage !== redirectUrl) {
      sessionStorage.setItem('redirect_after_login', currentPage);
    }
    window.location.href = redirectUrl;
  }
}

/**
 * Redirect to admin login page if not admin
 * @param {string} redirectUrl - URL to redirect to
 */
function requireAdmin(redirectUrl = '/admin-login.html') {
  if (!isLoggedIn() || !isAdmin()) {
    window.location.href = redirectUrl;
  }
}

/**
 * Get redirect URL after login
 * @returns {string} URL to redirect to or default home page
 */
function getRedirectAfterLogin() {
  const redirect = sessionStorage.getItem('redirect_after_login');
  sessionStorage.removeItem('redirect_after_login');
  return redirect || '/home.html';
}

/**
 * Initialize auth state on page load
 * Cleans up expired tokens
 */
function initAuth() {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    removeToken();
  }
}

// Initialize auth on script load
initAuth();
