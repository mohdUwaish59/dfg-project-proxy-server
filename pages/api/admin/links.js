// Get admin links API route for Next.js
const { getAllProxyLinks } = require('../../../lib/database');
const { requireAuth } = require('../../../lib/auth');
const { logActivity } = require('../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = requireAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }

  try {
    console.log('🔍 /admin/links endpoint called');
    const links = await getAllProxyLinks();
    console.log('🔍 /admin/links returning:', links.length, 'links');
    res.json(links);
  } catch (err) {
    console.error('❌ Get links error:', err);
    logActivity('Get links error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
}