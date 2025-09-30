// Reset link usage API route for Next.js
const { resetProxyLinkUsage } = require('../../../lib/database');
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
    await resetProxyLinkUsage(proxyId);
    
    logActivity('Link usage reset', { 
      proxyId, 
      admin: user.username 
    });
    
    res.json({ success: true });
    
  } catch (err) {
    logActivity('Reset usage error', { error: err.message, proxyId });
    return res.status(500).json({ error: 'Database error' });
  }
}