// Join waiting room API route for Next.js
const { getActiveProxyLink, checkLinkUsage, recordLinkUsage, getWaitingParticipants, createGroupSession } = require('../../../../lib/database');
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

    // Check if user already joined this link
    const existingUsage = await checkLinkUsage(proxyId, fingerprint);
    
    if (existingUsage) {
      // User already joined, return their current status
      return res.json({
        canJoin: true,
        alreadyJoined: true,
        status: existingUsage.status,
        participantNumber: existingUsage.participant_number,
        groupSessionId: existingUsage.group_session_id
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
    const updatedWaitingParticipants = await getWaitingParticipants(proxyId);
    const isGroupComplete = updatedWaitingParticipants.length >= link.max_uses;

    console.log('Group status check:', {
      proxyId,
      waitingCount: updatedWaitingParticipants.length,
      maxUses: link.max_uses,
      isGroupComplete
    });

    let groupSessionId = null;
    if (isGroupComplete) {
      // Create group session and mark all as ready for redirect
      const participantFingerprints = updatedWaitingParticipants.map(p => p.user_fingerprint);
      groupSessionId = await createGroupSession(proxyId, participantFingerprints);
      
      console.log('Group completed! Created session:', groupSessionId);
      
      logActivity('Group completed - ready for redirect', { 
        proxyId, 
        groupSessionId,
        participantCount: updatedWaitingParticipants.length
      });
    }

    return res.json({
      canJoin: true,
      alreadyJoined: false,
      status: isGroupComplete ? 'redirected' : 'waiting',
      participantNumber: participantNumber,
      currentWaiting: isGroupComplete ? link.max_uses : updatedWaitingParticipants.length,
      maxParticipants: link.max_uses,
      isGroupComplete: isGroupComplete,
      groupSessionId: groupSessionId,
      redirectUrl: isGroupComplete ? link.real_url : null
    });

  } catch (error) {
    console.error('❌ Join waiting room error:', error);
    logActivity('Join waiting room error', { error: error.message, proxyId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}