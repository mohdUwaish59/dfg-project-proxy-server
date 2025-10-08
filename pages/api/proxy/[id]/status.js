// Get group status API route for Next.js
const { getGroupStatus, checkLinkUsage, checkRoomExpiration } = require('../../../../lib/database');
const { logActivity } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint } = req.query;

  try {
    // Check room expiration first
    const roomStatus = await checkRoomExpiration(proxyId);
    
    // Get overall group status
    const groupStatus = await getGroupStatus(proxyId);
    
    if (!groupStatus) {
      return res.status(404).json({ 
        error: 'Link not found or inactive'
      });
    }

    let userStatus = null;
    if (fingerprint) {
      // Get specific user's status
      const userUsage = await checkLinkUsage(proxyId, fingerprint);
      if (userUsage) {
        userStatus = {
          status: userUsage.status,
          participantNumber: userUsage.participant_number,
          groupSessionId: userUsage.group_session_id,
          joinedAt: userUsage.joined_at,
          redirectedAt: userUsage.redirected_at
        };
        
        // If group is complete but user status is still waiting, something went wrong
        if (groupStatus.has_redirected_group && userUsage.status === 'waiting') {
          console.log('Warning: User still waiting but group has redirected participants');
          console.log('User fingerprint:', fingerprint.substring(0, 8) + '...');
          console.log('User status:', userUsage.status);
          console.log('Group status:', groupStatus);
        }
      }
    }

    return res.json({
      ...groupStatus,
      userStatus: userStatus,
      roomStartTime: roomStatus.roomStartTime || null,
      roomExpired: roomStatus.expired,
      timeLeft: roomStatus.timeLeft,
      status: roomStatus.expired ? 'expired' : groupStatus.status || 'waiting',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get group status error:', error);
    logActivity('Get group status error', { error: error.message, proxyId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}