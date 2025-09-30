// Get waiting rooms status API route for Next.js
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
    console.log('🔍 /admin/waiting-rooms endpoint called');
    
    const links = await getAllProxyLinks();
    const waitingRoomsStatus = [];

    for (const link of links) {
      if (link.is_active) {
        const waitingParticipants = await getWaitingParticipants(link.proxy_id);
        
        waitingRoomsStatus.push({
          proxy_id: link.proxy_id,
          group_name: link.group_name,
          category: link.category,
          treatment_title: link.treatment_title,
          max_uses: link.max_uses,
          current_uses: link.current_uses,
          waiting_count: waitingParticipants.length,
          is_full: waitingParticipants.length >= link.max_uses,
          waiting_participants: waitingParticipants.map(p => ({
            participant_number: p.participant_number,
            joined_at: p.joined_at,
            status: p.status
          })),
          created_at: link.created_at
        });
      }
    }

    console.log('🔍 /admin/waiting-rooms returning:', waitingRoomsStatus.length, 'active rooms');
    res.json(waitingRoomsStatus);

  } catch (err) {
    console.error('❌ Get waiting rooms error:', err);
    logActivity('Get waiting rooms error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
}