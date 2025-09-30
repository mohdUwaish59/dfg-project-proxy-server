// Proxy page API route for Vercel
const { getDatabase } = require('../../../src/database');
const { logActivity } = require('../../../src/utils');

export default async function handler(req, res) {
  const { id: proxyId } = req.query;

  if (req.method === 'GET') {
    // Handle proxy page access
    try {
      // Initialize database if needed
      try {
        const { initDatabase } = require('../../../src/database');
        await initDatabase();
      } catch (initError) {
        console.log('ℹ️ Database already initialized or initialization not needed');
      }
      
      const db = getDatabase();
      
      // Check if link exists and is active
      const link = await db.get('SELECT * FROM proxy_links WHERE proxy_id = ? AND is_active = ?', [proxyId, true]);
      
      if (!link) {
        return res.status(404).json({ 
          error: 'Link not found or inactive',
          canAccess: false 
        });
      }

      // Return link info for the frontend to handle
      return res.json({
        exists: true,
        groupName: link.group_name,
        maxUses: link.max_uses,
        currentUses: link.current_uses,
        isActive: link.is_active
      });

    } catch (error) {
      console.error('❌ Proxy page error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}