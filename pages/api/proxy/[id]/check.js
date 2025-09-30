// Proxy check API route for Vercel
const { getDatabase } = require('../../../../src/database');
const { logActivity } = require('../../../../src/utils');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint } = req.body;

  try {
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../../src/database');
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

    // Check if user already used this link
    const existingUsage = await db.get('SELECT * FROM link_usage WHERE proxy_id = ? AND user_fingerprint = ?', [proxyId, fingerprint]);
    
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
    await db.run('INSERT INTO link_usage (proxy_id, session_id, user_ip, user_fingerprint, participant_number) VALUES (?, ?, ?, ?, ?)', 
      [proxyId, req.headers['x-vercel-id'] || 'unknown', req.ip || 'unknown', fingerprint, participantNumber]);
    
    // Update usage count
    await db.run('UPDATE proxy_links SET current_uses = current_uses + 1 WHERE proxy_id = ?', [proxyId]);
    
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