// Proxy check API route for Next.js
const { getActiveProxyLink, checkLinkUsage, recordLinkUsage, incrementProxyLinkUsage } = require('../../../../lib/database');
const { logActivity, getClientIP } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint } = req.body;

  try {
    // Check if link exists and is active
    const link = await getActiveProxyLink(proxyId);
    
    if (!link) {
      return res.status(404).json({ 
        error: 'Link not found or inactive',
        canAccess: false 
      });
    }

    // Check if user already used this link
    const existingUsage = await checkLinkUsage(proxyId, fingerprint);
    
    if (existingUsage) {
      return res.json({
        canAccess: true,
        alreadyUsed: true,
        redirectUrl: link.real_url,
        participantNumber: existingUsage.participant_number
      });
    }

    // Check if link is full
    if (link.current_uses >= link.max_uses) {
      return res.status(403).json({
        error: 'This experiment link has reached its maximum number of participants',
        canAccess: false
      });
    }

    // Allow access and record usage
    const participantNumber = link.current_uses + 1;
    
    // Record usage
    await recordLinkUsage(
      proxyId, 
      req.headers['x-vercel-id'] || 'unknown', 
      getClientIP(req), 
      fingerprint, 
      participantNumber
    );
    
    // Update usage count
    await incrementProxyLinkUsage(proxyId);
    
    logActivity('Proxy link accessed', { proxyId, participantNumber, fingerprint });

    return res.json({
      canAccess: true,
      alreadyUsed: false,
      redirectUrl: link.real_url,
      participantNumber: participantNumber
    });

  } catch (error) {
    console.error('❌ Proxy check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}