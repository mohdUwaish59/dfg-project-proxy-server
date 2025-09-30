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

  const { realUrl, groupName, category, treatmentTitle } = req.body;
  const maxUses = 3; // Fixed for oTree experiments
  
  // Validate input
  if (!isValidUrl(realUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Validate category
  const validCategories = ['No Gender', 'All Male', 'All Female', 'Mixed'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category selected' });
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
    const sanitizedGroupName = sanitizeInput(groupName);
    const proxyId = generateProxyId();
    
    await createProxyLink(proxyId, realUrl, sanitizedGroupName || null, maxUses, category, treatmentTitle);
    
    logActivity('Link created', { 
      proxyId, 
      groupName: sanitizedGroupName,
      category,
      treatmentTitle,
      admin: user.username 
    });
    
    res.json({ success: true, proxyId });
    
  } catch (err) {
    logActivity('Create link error', { error: err.message, groupName: sanitizedGroupName });
    return res.status(500).json({ error: 'Database error: ' + err.message });
  }
}