// Get admin links API route for Vercel
const { getDatabase } = require('../../../src/database');
const { verifyToken } = require('../../../src/auth/jwt-auth');
const { logActivity } = require('../../../src/utils');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const token = req.cookies['auth-token'];
  const user = verifyToken(token);
  
  if (!user) {
    console.log('❌ Authentication required');
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }

  try {
    console.log('🔍 /admin/links endpoint called');
    
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../src/database');
      await initDatabase();
    } catch (initError) {
      console.log('ℹ️ Database already initialized or initialization not needed');
    }
    
    const db = getDatabase();
    const rows = await db.all('SELECT * FROM proxy_links ORDER BY created_at DESC');
    console.log('🔍 /admin/links returning:', rows.length, 'links');
    res.json(rows);
  } catch (err) {
    console.error('❌ Get links error:', err);
    logActivity('Get links error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
}