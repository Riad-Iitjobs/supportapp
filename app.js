// SupportHub - Utility Functions

// Navigation helper
function navigateTo(page) {
  window.location.href = page;
}

// Check if user is logged in
function isLoggedIn() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.loggedIn === true;
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

// Logout function
function logout() {
  localStorage.removeItem('user');
  navigateTo('login.html');
}

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.zIndex = '1000';
  toast.style.minWidth = '250px';
  toast.style.maxWidth = '90%';
  toast.style.animation = 'slideDown 0.3s ease';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// Local Storage helpers
const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },

  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};

// Form validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\d\s\-\+\(\)]+$/;
  return phone.length >= 10 && re.test(phone);
}

// Set active navigation item
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();

  // Check if user info should be displayed
  const user = getCurrentUser();
  const userInfoElements = document.querySelectorAll('[data-user-info]');

  userInfoElements.forEach(el => {
    if (isLoggedIn()) {
      el.textContent = user.name || user.email || 'User';
    }
  });
});

// Debounce helper for search/input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle helper for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    navigateTo,
    isLoggedIn,
    getCurrentUser,
    logout,
    formatDate,
    generateId,
    showToast,
    storage,
    validateEmail,
    validatePhone,
    debounce,
    throttle
  };
}
