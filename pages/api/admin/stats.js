// Get admin stats API route for Vercel
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
    console.log('🔍 /admin/stats endpoint called');
    
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../src/database');
      await initDatabase();
    } catch (initError) {
      console.log('ℹ️ Database already initialized or initialization not needed');
    }
    
    const db = getDatabase();
    const result = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(current_uses) as participants,
        SUM(CASE WHEN current_uses >= max_uses THEN 1 ELSE 0 END) as full
      FROM proxy_links
    `);
    console.log('🔍 /admin/stats returning:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ Get stats error:', err);
    logActivity('Get stats error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
}