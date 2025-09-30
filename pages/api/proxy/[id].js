// Proxy page API route for Next.js
const { getActiveProxyLink } = require('../../../lib/database');
const { logActivity } = require('../../../lib/utils-server');

export default async function handler(req, res) {
  const { id: proxyId } = req.query;

  if (req.method === 'GET') {
    // Handle proxy page access
    try {
      // Check if link exists and is active
      const link = await getActiveProxyLink(proxyId);
      
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