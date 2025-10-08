// Join waiting room API route for Next.js
const { getActiveProxyLink, checkLinkUsage, recordLinkUsage, getWaitingParticipants, createGroupSession, setRoomStartTime, checkRoomExpiration, getAllParticipants } = require('../../../../lib/database');
const { logActivity, getClientIP } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint } = req.body;

  if (!fingerprint) {
    return res.status(400).json({ error: 'Fingerprint is required' });
  }

  try {
    // Check if link exists and is active
    const link = await getActiveProxyLink(proxyId);
    
    if (!link) {
      return res.status(404).json({ 
        error: 'Link not found or inactive',
        canJoin: false 
      });
    }

    // Check if room has expired
    const roomStatus = await checkRoomExpiration(proxyId);
    if (roomStatus.expired) {
      return res.status(403).json({
        error: 'This waiting room has expired. The time limit was reached.',
        canJoin: false,
        status: 'expired'
      });
    }

    // Check if user already joined this link
    const existingUsage = await checkLinkUsage(proxyId, fingerprint);
    
    if (existingUsage) {
      // User already joined, get current group status
      const allCurrentParticipants = await getAllParticipants(proxyId);
      const isGroupComplete = allCurrentParticipants.length >= link.max_uses;
      
      // Get updated room status for timing info
      const updatedRoomStatus = await checkRoomExpiration(proxyId);
      
      console.log('Existing user rejoining:', {
        fingerprint: fingerprint.substring(0, 8) + '...',
        currentStatus: existingUsage.status,
        totalParticipants: allCurrentParticipants.length,
        isGroupComplete
      });
      
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
        roomStartTime: updatedRoomStatus.roomStartTime || null
      });
    }

    // Check if link is already full
    const waitingParticipants = await getWaitingParticipants(proxyId);
    if (waitingParticipants.length >= link.max_uses) {
      return res.status(403).json({
        error: 'This experiment is full. No more participants can join.',
        canJoin: false
      });
    }

    // Add participant to waiting room
    const participantNumber = waitingParticipants.length + 1;
    
    // Set room start time if this is the first participant
    if (waitingParticipants.length === 0) {
      await setRoomStartTime(proxyId);
      console.log('Room timer started for proxyId:', proxyId);
    }
    
    await recordLinkUsage(
      proxyId, 
      req.headers['x-vercel-id'] || 'unknown', 
      getClientIP(req), 
      fingerprint, 
      participantNumber
    );

    logActivity('Participant joined waiting room', { 
      proxyId, 
      participantNumber, 
      fingerprint: fingerprint.substring(0, 8) + '...'
    });

    // Check if this completes the group
    const allParticipants = await getAllParticipants(proxyId);
    const updatedWaitingParticipants = await getWaitingParticipants(proxyId);
    const isGroupComplete = allParticipants.length >= link.max_uses;

    console.log('Group status check:', {
      proxyId,
      totalParticipants: allParticipants.length,
      waitingCount: updatedWaitingParticipants.length,
      maxUses: link.max_uses,
      isGroupComplete
    });

    let groupSessionId = null;
    if (isGroupComplete) {
      // Create group session and mark all waiting participants as ready for redirect
      const participantFingerprints = allParticipants.map(p => p.user_fingerprint);
      
      console.log('Creating group session for all participants:', participantFingerprints);
      console.log('Waiting participants:', updatedWaitingParticipants.map(p => p.user_fingerprint));
      
      groupSessionId = await createGroupSession(proxyId, participantFingerprints);
      
      console.log('Group completed! Created session:', groupSessionId);
      console.log('Updated participants:', participantFingerprints.length);
      
      logActivity('Group completed - ready for redirect', { 
        proxyId, 
        groupSessionId,
        participantCount: allParticipants.length,
        participantFingerprints: participantFingerprints.map(fp => fp.substring(0, 8) + '...')
      });
    }

    // Get updated room status for timing info
    const updatedRoomStatus = await checkRoomExpiration(proxyId);

    return res.json({
      canJoin: true,
      alreadyJoined: false,
      status: isGroupComplete ? 'redirected' : 'waiting',
      participantNumber: participantNumber,
      currentWaiting: allParticipants.length,
      maxParticipants: link.max_uses,
      isGroupComplete: isGroupComplete,
      groupSessionId: groupSessionId,
      redirectUrl: isGroupComplete ? link.real_url : null,
      roomStartTime: updatedRoomStatus.roomStartTime || null
    });

  } catch (error) {
    console.error('❌ Join waiting room error:', error);
    logActivity('Join waiting room error', { error: error.message, proxyId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}