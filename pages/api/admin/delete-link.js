// Delete link API route for Next.js
const { deleteProxyLink } = require('../../../lib/database');
const { requireAuth } = require('../../../lib/auth');
const { logActivity } = require('../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = requireAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }

  const { proxyId } = req.body;
  
  if (!proxyId) {
    return res.status(400).json({ error: 'Proxy ID is required' });
  }

  try {
    const result = await deleteProxyLink(proxyId);
    
    if (result.deletedCount === 0) {
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