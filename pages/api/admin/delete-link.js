// Delete link API route for Vercel
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

  const { proxyId } = req.body;
  
  if (!proxyId) {
    return res.status(400).json({ error: 'Proxy ID is required' });
  }

  try {
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../src/database');
      await initDatabase();
    } catch (initError) {
      console.log('ℹ️ Database already initialized or initialization not needed');
    }
    
    const db = getDatabase();
    
    // Delete usage records first
    await db.run('DELETE FROM link_usage WHERE proxy_id = ?', [proxyId]);
    
    // Delete the link
    const result = await db.run('DELETE FROM proxy_links WHERE proxy_id = ?', [proxyId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    logActivity('Link deleted', { 
      proxyId, 
      admin: user.username 
    });
    
    res.json({ success: true });
    
  } catch (err) {
    logActivity('Delete link error', { error: err.message, proxyId });
    return res.status(500).json({ error: 'Database error' });
  }
}