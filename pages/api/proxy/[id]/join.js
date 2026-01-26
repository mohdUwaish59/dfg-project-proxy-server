// Join waiting room API route for Next.js
const { getActiveProxyLink, checkLinkUsage, recordLinkUsage, getWaitingParticipants, createGroupSession, checkParticipantExpiration, getAllParticipants, deleteExpiredParticipant } = require('../../../../lib/database');
const { logActivity, getClientIP } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint, prolific_pid } = req.body;

  // TESTING MODE: Use Prolific ID as unique identifier instead of fingerprint
  const uniqueIdentifier = prolific_pid || fingerprint || 'test_' + Date.now();
  
  if (!uniqueIdentifier) {
    return res.status(400).json({ error: 'Prolific ID or fingerprint is required' });
  }
  
  console.log('🔍 Using unique identifier:', uniqueIdentifier.substring(0, 15) + '...');

  try {
    // Check if link exists and is active
    const link = await getActiveProxyLink(proxyId);
    
    if (!link) {
      return res.status(404).json({ 
        error: 'Link not found or inactive',
        canJoin: false 
      });
    }

    console.log('🔍 Link details:', {
      proxy_id: link.proxy_id,
      group_name: link.group_name,
      max_uses: link.max_uses,
      current_uses: link.current_uses,
      is_active: link.is_active,
      status: link.status
    });

    // Check if user already joined this link
    const existingUsage = await checkLinkUsage(proxyId, uniqueIdentifier);
    
    if (existingUsage) {
      // User already joined, check their individual timer
      const participantTimerStatus = await checkParticipantExpiration(proxyId, uniqueIdentifier);
      const allCurrentParticipants = await getAllParticipants(proxyId);
      const isGroupComplete = allCurrentParticipants.length >= link.max_uses;
      
      console.log('Existing user rejoining:', {
        identifier: uniqueIdentifier.substring(0, 15) + '...',
        currentStatus: existingUsage.status,
        timerExpired: participantTimerStatus.expired,
        timeLeft: participantTimerStatus.timeLeft,
        totalParticipants: allCurrentParticipants.length,
        isGroupComplete
      });
      
      // Block rejoin if user was already redirected (successfully joined a group)
      if (existingUsage.status === 'redirected') {
        return res.status(403).json({
          error: 'You have already participated in this experiment and were redirected to the study.',
          canJoin: false,
          errorType: 'already_participated'
        });
      }
      
      // Block rejoin if user's timer is still active (not expired)
      if (existingUsage.status === 'waiting' && !participantTimerStatus.expired) {
        return res.json({
          canJoin: true,
          alreadyJoined: true,
          status: existingUsage.status,
          participantNumber: existingUsage.participant_number,
          groupSessionId: existingUsage.group_session_id,
          currentWaiting: allCurrentParticipants.length,
          maxParticipants: link.max_uses,
          isGroupComplete: isGroupComplete,
          redirectUrl: isGroupComplete ? link.real_url : null,
          participantTimerStart: participantTimerStatus.timerStart,
          participantTimeLeft: participantTimerStatus.timeLeft,
          participantTimerExpired: participantTimerStatus.expired
        });
      }
      
      // Allow rejoin if user's timer has expired - they get a fresh start
      if (existingUsage.status === 'expired' || participantTimerStatus.expired) {
        console.log('🔄 Allowing expired participant to rejoin with fresh timer:', {
          identifier: uniqueIdentifier.substring(0, 15) + '...',
          previousStatus: existingUsage.status,
          timerExpired: participantTimerStatus.expired
        });
        
        // Delete the old expired record so they can join fresh
        await deleteExpiredParticipant(proxyId, uniqueIdentifier);
        
        logActivity('Expired participant rejoining with fresh timer', { 
          proxyId, 
          identifier: uniqueIdentifier.substring(0, 15) + '...',
          previousStatus: existingUsage.status
        });
        
        // Continue to new participant logic below
      }
    }

    // Check if room has reached maximum capacity
    const allParticipantsCount = await getAllParticipants(proxyId);
    const totalParticipants = allParticipantsCount.length;
    
    console.log('🔍 Checking room capacity:', {
      totalParticipants: totalParticipants,
      maxCapacity: link.max_uses,
      groupsFormed: link.groups_formed || 0,
      isFull: totalParticipants >= link.max_uses
    });
    
    if (totalParticipants >= link.max_uses) {
      return res.status(403).json({
        error: 'This experiment room is full. Maximum capacity reached.',
        canJoin: false,
        errorType: 'full'
      });
    }

    // Add participant to waiting room
    const participantNumber = totalParticipants + 1;
    
    // Record participant with their individual timer FIRST
    await recordLinkUsage(
      proxyId, 
      req.headers['x-vercel-id'] || 'unknown', 
      getClientIP(req), 
      uniqueIdentifier,
      participantNumber,
      prolific_pid
    );

    logActivity('Participant joined waiting room', { 
      proxyId, 
      participantNumber, 
      prolific_pid: prolific_pid,
      identifier: uniqueIdentifier.substring(0, 15) + '...'
    });

    // Simple group formation: First 3 participants form a group
    const groupSize = 3;
    const waitingParticipants = await getWaitingParticipants(proxyId);
    const canFormGroup = waitingParticipants.length >= groupSize;

    console.log('🔍 Simple group formation check:', {
      proxyId,
      groupSize,
      waitingCount: waitingParticipants.length,
      canForm: canFormGroup
    });

    let groupSessionId = null;
    let isThisParticipantInGroup = false;
    
    if (canFormGroup) {
      // Take first 3 participants (FIFO)
      const participantsToGroup = waitingParticipants.slice(0, groupSize);
      const participantFingerprints = participantsToGroup.map(p => p.user_fingerprint);
      
      // Check if the current participant is in this group
      isThisParticipantInGroup = participantFingerprints.includes(uniqueIdentifier);
      
      console.log('✅ Creating simple group session:', {
        participantCount: participantFingerprints.length,
        fingerprints: participantFingerprints.map(fp => fp.substring(0, 8) + '...'),
        currentParticipantInGroup: isThisParticipantInGroup
      });
      
      groupSessionId = await createGroupSession(proxyId, participantFingerprints);
      
      console.log('✅ Group formed! Session:', groupSessionId, '- Room stays open for more participants');
      
      logActivity('Simple group formed - participants redirected', { 
        proxyId, 
        groupSessionId,
        participantCount: participantFingerprints.length,
        groupNumber: (link.groups_formed || 0) + 1,
        participantFingerprints: participantFingerprints.map(fp => fp.substring(0, 8) + '...')
      });
    }

    // Get participant's timer status and current counts
    const participantTimerStatus = await checkParticipantExpiration(proxyId, uniqueIdentifier);

    return res.json({
      canJoin: true,
      alreadyJoined: false,
      status: isThisParticipantInGroup ? 'redirected' : 'waiting',
      participantNumber: participantNumber,
      currentWaiting: waitingParticipants.length,
      maxParticipants: link.max_uses,
      groupSize: groupSize,
      isGroupComplete: isThisParticipantInGroup,
      groupSessionId: isThisParticipantInGroup ? groupSessionId : null,
      redirectUrl: isThisParticipantInGroup ? link.real_url : null,
      participantTimerStart: participantTimerStatus.timerStart,
      participantTimeLeft: participantTimerStatus.timeLeft,
      participantTimerExpired: participantTimerStatus.expired,
      groupsFormed: (link.groups_formed || 0) + (canFormGroup ? 1 : 0)
    });

  } catch (error) {
    console.error('❌ Join waiting room error:', error);
    logActivity('Join waiting room error', { error: error.message, proxyId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}