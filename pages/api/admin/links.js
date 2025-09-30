// Get admin links API route for Next.js
const { getAllProxyLinks, getWaitingParticipants } = require('../../../lib/database');
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
    
    // Add real-time waiting room data to each link
    const linksWithWaitingData = await Promise.all(
      links.map(async (link) => {
        if (link.is_active) {
          const waitingParticipants = await getWaitingParticipants(link.proxy_id);
          return {
            ...link,
            waiting_count: waitingParticipants.length,
            waiting_participants: waitingParticipants.map(p => ({
              participant_number: p.participant_number,
              joined_at: p.joined_at
            }))
          };
        }
        return {
          ...link,
          waiting_count: 0,
          waiting_participants: []
        };
      })
    );
    
    console.log('🔍 /admin/links returning:', linksWithWaitingData.length, 'links with waiting data');
    res.json(linksWithWaitingData);
  } catch (err) {
    console.error('❌ Get links error:', err);
    logActivity('Get links error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
}