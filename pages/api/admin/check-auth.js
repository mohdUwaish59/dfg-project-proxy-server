// Check authentication status API route for Next.js
const { getTokenFromRequest, verifyToken } = require('../../../lib/auth');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔍 Check auth called');
  const token = getTokenFromRequest(req);
  console.log('🔍 Auth token exists:', !!token);
  
  const user = verifyToken(token);
  const isLoggedIn = !!user;
  
  console.log('🔍 User verified:', !!user);
  console.log('🔍 Is logged in:', isLoggedIn);
  
  res.json({ isLoggedIn, user: user ? { username: user.username } : null });
}