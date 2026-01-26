// Create proxy link API route for Next.js
const { createProxyLink } = require('../../../lib/database');
const { requireAuth } = require('../../../lib/auth');
const { generateProxyId, isValidUrl, sanitizeInput, logActivity } = require('../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = requireAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }

  const { realUrl, treatmentTitle, otreeSessionId } = req.body;
  const maxUses = 200; // Room capacity - can accommodate up to 200 participants
  
  // Validate input
  if (!isValidUrl(realUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Validate oTree Session ID (required)
  if (!otreeSessionId || otreeSessionId.trim() === '') {
    return res.status(400).json({ error: 'oTree Session ID is required' });
  }

  // Validate treatment title
  const validTreatments = [
    'Treatment 1: No communication – No Gender Information',
    'Treatment 2: Chat Communication – No Gender Information', 
    'Treatment 3: Chat Communication – Gender Information',
    'Treatment 4: Video Chat Communication'
  ];
  if (treatmentTitle && !validTreatments.includes(treatmentTitle)) {
    return res.status(400).json({ error: 'Invalid treatment title selected' });
  }

  try {
    const sanitizedOtreeSessionId = sanitizeInput(otreeSessionId);
    const proxyId = generateProxyId();
    
    // Post-experiment redirect URL will be configured later after Prolific study creation
    await createProxyLink(proxyId, realUrl, null, maxUses, treatmentTitle, null, sanitizedOtreeSessionId);
    
    logActivity('Link created', { 
      proxyId, 
      otreeSessionId: sanitizedOtreeSessionId,
      treatmentTitle,
      admin: user.username 
    });
    
    res.json({ success: true, proxyId });
    
  } catch (err) {
    logActivity('Create link error', { error: err.message });
    return res.status(500).json({ error: 'Database error: ' + err.message });
  }
}