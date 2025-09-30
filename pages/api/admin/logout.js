// Admin logout API route for Next.js
const { clearAuthCookie, getTokenFromRequest, verifyToken } = require('../../../lib/auth');
const { logActivity } = require('../../../lib/utils-server');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromRequest(req);
  const user = verifyToken(token);
  const username = user?.username || 'unknown';
  
  clearAuthCookie(res);
  logActivity('Admin logout', { username });
  console.log('✅ User logged out, JWT cookie cleared');
  
  res.json({ success: true });
}