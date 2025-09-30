// Admin logout API route for Vercel
const { clearAuthCookie, verifyToken } = require('../../../src/auth/jwt-auth');
const { logActivity } = require('../../../src/utils');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies['auth-token'];
  const user = verifyToken(token);
  const username = user?.username || 'unknown';
  
  clearAuthCookie(res);
  logActivity('Admin logout', { username });
  console.log('✅ User logged out, JWT cookie cleared');
  
  res.json({ success: true });
}