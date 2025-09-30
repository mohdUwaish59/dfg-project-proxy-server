// Toggle link activation API route for Next.js
const { updateProxyLinkStatus } = require('../../../lib/database');
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

  const { proxyId, activate } = req.body;

  try {
    await updateProxyLinkStatus(proxyId, activate);
    
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