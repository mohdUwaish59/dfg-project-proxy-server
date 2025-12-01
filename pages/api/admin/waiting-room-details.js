// Get detailed waiting room information for admin monitoring
const { getProxyLink, getAllParticipants } = require('../../../lib/database');
const { requireAuth } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const user = requireAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized - Admin login required' });
  }

  const { proxyId } = req.query;

  if (!proxyId) {
    return res.status(400).json({ error: 'proxyId is required' });
  }

  try {
    // Get link details
    const link = await getProxyLink(proxyId);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Get all participants for this link
    const participants = await getAllParticipants(proxyId);

    // Organize participants by status
    const waiting = participants.filter(p => p.status === 'waiting');
    const redirected = participants.filter(p => p.status === 'redirected');
    const expired = participants.filter(p => p.status === 'expired');

    // Group redirected participants by group_session_id
    const groups = {};
    redirected.forEach(p => {
      const groupId = p.group_session_id || 'unknown';
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push({
        participant_number: p.participant_number,
        prolific_pid: p.prolific_pid,
        gender: p.gender,
        joined_at: p.joined_at,
        redirected_at: p.redirected_at
      });
    });

    // Format response
    const response = {
      link: {
        proxy_id: link.proxy_id,
        group_name: link.group_name,
        category: link.category,
        treatment_title: link.treatment_title,
        max_uses: link.max_uses,
        group_size: link.group_size || 3,
        current_uses: link.current_uses || 0,
        groups_formed: link.groups_formed || 0,
        is_active: link.is_active,
        status: link.status,
        room_start_time: link.room_start_time,
        room_expired: link.room_expired,
        created_at: link.created_at
      },
      participants: {
        total: participants.length,
        waiting: waiting.map(p => ({
          participant_number: p.participant_number,
          prolific_pid: p.prolific_pid,
          gender: p.gender,
          joined_at: p.joined_at,
          user_fingerprint: p.user_fingerprint?.substring(0, 8) + '...'
        })),
        redirected: Object.entries(groups).map(([groupId, members]) => ({
          group_session_id: groupId,
          group_number: members[0]?.participant_number ? Math.ceil(members[0].participant_number / 3) : 0,
          members: members,
          redirected_at: members[0]?.redirected_at
        })),
        expired: expired.map(p => ({
          participant_number: p.participant_number,
          prolific_pid: p.prolific_pid,
          gender: p.gender,
          joined_at: p.joined_at
        }))
      },
      statistics: {
        total_participants: participants.length,
        waiting_count: waiting.length,
        redirected_count: redirected.length,
        expired_count: expired.length,
        groups_formed: Object.keys(groups).length,
        capacity_remaining: link.max_uses - participants.length,
        capacity_percentage: Math.round((participants.length / link.max_uses) * 100)
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching waiting room details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
