const crypto = require('crypto');

/**
 * Generate a unique proxy ID
 * @returns {string} Random hex string
 */
function generateProxyId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Validate if a string is a valid URL
 * @param {string} string - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Middleware to check if user is admin
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
function requireAdmin(req, res, next) {
  if (!req.session.adminLoggedIn) {
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }
  next();
}

/**
 * Sanitize user input for display
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>&"']/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[char];
    })
    .trim()
    .substring(0, 500); // Limit length
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  try {
    return new Date(date).toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Get client IP address
 * @param {object} req - Express request object
 * @returns {string} Client IP address
 */
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * Log activity for debugging
 * @param {string} action - Action being performed
 * @param {object} data - Additional data to log
 */
function logActivity(action, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${action}:`, data);
}

module.exports = {
  generateProxyId,
  isValidUrl,
  requireAdmin,
  sanitizeInput,
  formatDate,
  getClientIP,
  logActivity
};