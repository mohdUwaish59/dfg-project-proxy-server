// Check authentication status API route for Next.js
const { getTokenFromRequest, verifyToken } = require('../../../lib/auth');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getTokenFromRequest(req);
  const user = verifyToken(token);
  const isLoggedIn = !!user;
  
  res.json({ isLoggedIn, user: user ? { username: user.username } : null });
}