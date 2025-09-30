// Toggle link activation API route for Vercel
const { getDatabase } = require('../../../src/database');
const { verifyToken } = require('../../../src/auth/jwt-auth');
const { logActivity } = require('../../../src/utils');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const token = req.cookies['auth-token'];
  const user = verifyToken(token);
  
  if (!user) {
    console.log('❌ Authentication required');
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }

  const { proxyId, activate } = req.body;

  try {
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../src/database');
      await initDatabase();
    } catch (initError) {
      console.log('ℹ️ Database already initialized or initialization not needed');
    }
    
    const db = getDatabase();
    
    await db.run('UPDATE proxy_links SET is_active = ? WHERE proxy_id = ?', 
      [activate ? 1 : 0, proxyId]);
    
    logActivity('Link toggled', { 
      proxyId, 
      activate, 
      admin: user.username 
    });
    
    res.json({ success: true });
    
  } catch (err) {
    logActivity('Toggle link error', { error: err.message, proxyId });
    return res.status(500).json({ error: 'Database error' });
  }
}