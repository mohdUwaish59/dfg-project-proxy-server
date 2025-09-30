// Server-side utility functions for Next.js
const crypto = require('crypto');

function generateProxyId() {
  return crypto.randomBytes(8).toString('hex');
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

function logActivity(action, details = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${action}:`, details);
  
  // In a production app, you might want to store this in the database
  // For now, we'll just log to console
}

function generateFingerprint() {
  // Generate a simple browser fingerprint
  return crypto.randomBytes(16).toString('hex');
}

function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         'unknown';
}

module.exports = {
  generateProxyId,
  isValidUrl,
  sanitizeInput,
  logActivity,
  generateFingerprint,
  getClientIP
};