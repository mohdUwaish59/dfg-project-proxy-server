// Get group status API route for Next.js
const { getGroupStatus, checkLinkUsage } = require('../../../../lib/database');
const { logActivity } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint } = req.query;

  try {
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
      }
    }

    return res.json({
      ...groupStatus,
      userStatus: userStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get group status error:', error);
    logActivity('Get group status error', { error: error.message, proxyId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}