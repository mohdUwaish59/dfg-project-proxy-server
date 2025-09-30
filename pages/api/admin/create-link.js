// Create proxy link API route for Vercel
const { getDatabase } = require('../../../src/database');
const { verifyToken } = require('../../../src/auth/jwt-auth');
const { generateProxyId, isValidUrl, sanitizeInput, logActivity } = require('../../../src/utils');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const token = req.cookies['auth-token'];
  const user = verifyToken(token);
  
  if (!user) {
    console.log('❌ Authentication required');
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }

  const { realUrl, groupName } = req.body;
  const maxUses = 3; // Fixed for oTree experiments
  
  // Validate input
  if (!isValidUrl(realUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../src/database');
      await initDatabase();
    } catch (initError) {
      console.log('ℹ️ Database already initialized or initialization not needed');
    }
    
    const db = getDatabase();
    const sanitizedGroupName = sanitizeInput(groupName);
    const proxyId = generateProxyId();
    
    await db.run('INSERT INTO proxy_links (proxy_id, real_url, group_name, max_uses, current_uses) VALUES (?, ?, ?, ?, 0)', 
      [proxyId, realUrl, sanitizedGroupName || null, maxUses]);
    
    logActivity('Link created', { 
      proxyId, 
      groupName: sanitizedGroupName, 
      admin: user.username 
    });
    
    res.json({ success: true, proxyId });
    
  } catch (err) {
    logActivity('Create link error', { error: err.message, groupName: sanitizedGroupName });
    return res.status(500).json({ error: 'Database error: ' + err.message });
  }
}