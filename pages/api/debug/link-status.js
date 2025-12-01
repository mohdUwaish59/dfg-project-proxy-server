// Debug endpoint to check link status
const { getProxyLink } = require('../../../lib/database');

export default async function handler(req, res) {
  const { proxyId } = req.query;

  if (!proxyId) {
    return res.status(400).json({ error: 'proxyId parameter required' });
  }

  try {
    const link = await getProxyLink(proxyId);
    
    if (!link) {
      return res.json({
        found: false,
        message: 'Link not found in database'
      });
    }

    return res.json({
      found: true,
      link: {
        proxy_id: link.proxy_id,
        group_name: link.group_name,
        category: link.category,
        max_uses: link.max_uses,
        current_uses: link.current_uses,
        is_active: link.is_active,
        status: link.status,
        room_start_time: link.room_start_time,
        room_expired: link.room_expired,
        created_at: link.created_at
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
}
