// Get admin stats API route for Next.js
const { getProxyStats } = require('../../../lib/database');
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
    console.log('🔍 /admin/stats endpoint called');
    const stats = await getProxyStats();
    console.log('🔍 /admin/stats returning:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ Get stats error:', err);
    logActivity('Get stats error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
}