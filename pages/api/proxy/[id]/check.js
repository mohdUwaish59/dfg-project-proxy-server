// Legacy proxy check API route - redirects to new waiting room system
const { getActiveProxyLink } = require('../../../../lib/database');
const { logActivity } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;

  try {
    // Check if link exists and is active
    const link = await getActiveProxyLink(proxyId);
    
    if (!link) {
      return res.status(404).json({ 
        error: 'Link not found or inactive',
        canAccess: false 
      });
    }

    // For backward compatibility, redirect to new waiting room system
    logActivity('Legacy API accessed - redirecting to waiting room', { proxyId });

    return res.json({
      canAccess: false,
      message: 'This experiment now uses a waiting room system. Please refresh the page.',
      useWaitingRoom: true,
      maxParticipants: link.max_uses
    });

  } catch (error) {
    console.error('❌ Legacy proxy check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}