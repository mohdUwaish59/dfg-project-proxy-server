// Admin login API route for Next.js
const { findAdminWithPassword } = require('../../../lib/database');
const { setAuthCookie, clearAuthCookie } = require('../../../lib/auth');
const { logActivity, getClientIP } = require('../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    console.log('❌ Missing username or password');
    logActivity('Admin login failed', { username: username || 'missing', reason: 'missing_credentials', ip: req.ip });
    
    clearAuthCookie(res);
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    // Check if user exists and password matches
    const userRow = await findAdminWithPassword(username, password);
    
    if (!userRow) {
      console.log('❌ Invalid credentials for user:', username);
      logActivity('Admin login failed', { username, reason: 'invalid_credentials', ip: getClientIP(req) });
      
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Authentication successful
    setAuthCookie(res, {
      username: username,
      adminLoggedIn: true
    });
    
    logActivity('Admin login successful', { username });
    
    return res.json({ success: true, user: { username } });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    logActivity('Admin login error', { error: error.message, username });
    return res.status(500).json({ 
      error: 'Login failed',
      details: error.message
    });
  }
}