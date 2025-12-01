// Get group status API route for Next.js
const { getGroupStatus, checkLinkUsage, checkParticipantExpiration } = require('../../../../lib/database');
const { logActivity } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint, prolific_pid } = req.query;

  // TESTING MODE: Use Prolific ID as unique identifier instead of fingerprint
  const uniqueIdentifier = prolific_pid || fingerprint;

  try {
    // Get overall group status
    const groupStatus = await getGroupStatus(proxyId);
    
    if (!groupStatus) {
      return res.status(404).json({ 
        error: 'Link not found or inactive'
      });
    }

    let userStatus = null;
    let participantTimerStatus = null;
    
    if (uniqueIdentifier) {
      // Get specific user's status
      const userUsage = await checkLinkUsage(proxyId, uniqueIdentifier);
      if (userUsage) {
        // Check participant's individual timer
        participantTimerStatus = await checkParticipantExpiration(proxyId, uniqueIdentifier);
        
        userStatus = {
          status: userUsage.status,
          participantNumber: userUsage.participant_number,
          groupSessionId: userUsage.group_session_id,
          joinedAt: userUsage.joined_at,
          redirectedAt: userUsage.redirected_at,
          participantTimerStart: participantTimerStatus.timerStart,
          participantTimeLeft: participantTimerStatus.timeLeft,
          participantTimerExpired: participantTimerStatus.expired
        };
        
        // If group is complete but user status is still waiting, something went wrong
        if (groupStatus.has_redirected_group && userUsage.status === 'waiting') {
          console.log('Warning: User still waiting but group has redirected participants');
          console.log('User identifier:', uniqueIdentifier.substring(0, 15) + '...');
          console.log('User status:', userUsage.status);
          console.log('Group status:', groupStatus);
        }
      }
    }

    // Include participant gender if available
    let participantGender = null;
    if (uniqueIdentifier) {
      const userUsage = await checkLinkUsage(proxyId, uniqueIdentifier);
      if (userUsage && userUsage.gender) {
        participantGender = userUsage.gender;
      }
    }

    const responseData = {
      ...groupStatus,
      userStatus: userStatus,
      participantGender: participantGender,
      participantTimerStart: participantTimerStatus?.timerStart || null,
      participantTimeLeft: participantTimerStatus?.timeLeft || 600,
      participantTimerExpired: participantTimerStatus?.expired || false,
      status: participantTimerStatus?.expired ? 'expired' : (userStatus?.status || 'waiting'),
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 STATUS API RESPONSE for', uniqueIdentifier?.substring(0, 15) + '...');
    console.log('  - userStatus?.status:', userStatus?.status);
    console.log('  - responseData.status:', responseData.status);
    console.log('  - real_url:', groupStatus.real_url);
    
    return res.json(responseData);

  } catch (error) {
    console.error('❌ Get group status error:', error);
    logActivity('Get group status error', { error: error.message, proxyId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}