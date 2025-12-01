// Join waiting room API route for Next.js
const { getActiveProxyLink, checkLinkUsage, recordLinkUsage, getWaitingParticipants, createGroupSession, checkParticipantExpiration, getAllParticipants, canFormGenderBasedGroup } = require('../../../../lib/database');
const { logActivity, getClientIP } = require('../../../../lib/utils-server');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;
  const { fingerprint, gender, prolific_pid } = req.body;

  // TESTING MODE: Use Prolific ID as unique identifier instead of fingerprint
  const uniqueIdentifier = prolific_pid || fingerprint || 'test_' + Date.now();
  
  if (!uniqueIdentifier) {
    return res.status(400).json({ error: 'Prolific ID or fingerprint is required' });
  }

  // Validate gender if provided
  const validGenders = ['MALE', 'FEMALE', 'OTHER'];
  const normalizedGender = gender ? gender.toUpperCase() : null;
  
  if (normalizedGender && !validGenders.includes(normalizedGender)) {
    console.log('⚠️ Invalid gender provided:', gender);
    return res.status(400).json({ error: 'Invalid gender. Must be MALE, FEMALE, or OTHER' });
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

    // Check gender requirements
    const category = link.category || 'No Gender';
    
    // Check if gender is required but not provided
    if ((category === 'All Male' || category === 'All Female') && !normalizedGender) {
      return res.status(400).json({
        error: `This experiment requires gender information. Please provide your gender to continue.`,
        canJoin: false,
        requiredGender: category === 'All Male' ? 'MALE' : 'FEMALE',
        missingParameter: 'gender',
        groupName: link.group_name,
        category: category
      });
    }
    
    // Validate gender for gender-specific categories
    if (category === 'All Male' && normalizedGender !== 'MALE') {
      return res.status(403).json({
        error: 'This experiment is for male participants only.',
        canJoin: false,
        requiredGender: 'MALE'
      });
    }
    
    if (category === 'All Female' && normalizedGender !== 'FEMALE') {
      return res.status(403).json({
        error: 'This experiment is for female participants only.',
        canJoin: false,
        requiredGender: 'FEMALE'
      });
    }
    
    if (category === 'Mixed' && !normalizedGender) {
      return res.status(400).json({
        error: 'Gender information is required for mixed gender experiments.',
        canJoin: false,
        missingParameter: 'gender',
        groupName: link.group_name,
        category: category
      });
    }

    // Check if user already joined this link
    const existingUsage = await checkLinkUsage(proxyId, fingerprint);
    
    if (existingUsage) {
      console.log('⚠️ User already joined this room:', {
        fingerprint: fingerprint.substring(0, 8) + '...',
        participantNumber: existingUsage.participant_number,
        currentStatus: existingUsage.status,
        prolificPid: existingUsage.prolific_pid
      });
      
      // Return error - user cannot join again
      return res.status(403).json({
        error: 'You have already joined this waiting room. Please use your original tab/window.',
        canJoin: false,
        errorType: 'already_joined',
        participantNumber: existingUsage.participant_number,
        status: existingUsage.status,
        joinedAt: existingUsage.joined_at
      });
    }

    // Check if room has reached maximum capacity
    const allParticipantsCount = await getAllParticipants(proxyId);
    const totalParticipants = allParticipantsCount.length;
    
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
      uniqueIdentifier,  // Use unique identifier instead of fingerprint
      participantNumber,
      normalizedGender,
      prolific_pid
    );

    logActivity('Participant joined waiting room', { 
      proxyId, 
      participantNumber, 
      gender: normalizedGender,
      prolific_pid: prolific_pid,
      identifier: uniqueIdentifier.substring(0, 15) + '...'
    });

    // NOW check if a group can be formed (AFTER participant is recorded)
    const groupSize = link.group_size || 3; // Fixed group size of 3
    const groupFormationResult = await canFormGenderBasedGroup(proxyId, category, groupSize);
    const canFormGroup = groupFormationResult.canForm;

    let groupSessionId = null;
    let isThisParticipantInGroup = false;
    
    if (canFormGroup && groupFormationResult.participants.length > 0) {
      // Create group session with the selected participants
      const participantFingerprints = groupFormationResult.participants.map(p => p.user_fingerprint);
      
      // Check if the current participant is in this group
      isThisParticipantInGroup = participantFingerprints.includes(uniqueIdentifier);
      
      // Pass group type for mixed gender groups
      groupSessionId = await createGroupSession(
        proxyId, 
        participantFingerprints, 
        groupFormationResult.groupType
      );
      
      logActivity('Gender-based group formed - participants redirected', { 
        proxyId, 
        groupSessionId,
        category,
        groupType: groupFormationResult.groupType || 'standard',
        participantCount: participantFingerprints.length,
        groupNumber: (link.groups_formed || 0) + 1,
        participantFingerprints: participantFingerprints.map(fp => fp.substring(0, 8) + '...')
      });
    }

    // Get participant's timer status and current counts
    const participantTimerStatus = await checkParticipantExpiration(proxyId, uniqueIdentifier);
    const waitingParticipants = await getWaitingParticipants(proxyId);

    return res.json({
      canJoin: true,
      alreadyJoined: false,
      status: isThisParticipantInGroup ? 'redirected' : 'waiting',
      participantNumber: participantNumber,
      currentWaiting: waitingParticipants.length,
      maxParticipants: link.max_uses, // Total room capacity
      groupSize: groupSize, // Size of each group
      isGroupComplete: isThisParticipantInGroup,
      groupSessionId: isThisParticipantInGroup ? groupSessionId : null,
      redirectUrl: isThisParticipantInGroup ? link.real_url : null,
      participantTimerStart: participantTimerStatus.timerStart,
      participantTimeLeft: participantTimerStatus.timeLeft,
      participantTimerExpired: participantTimerStatus.expired,
      category: category,
      participantGender: normalizedGender,
      groupsFormed: (link.groups_formed || 0) + (canFormGroup ? 1 : 0)
    });

  } catch (error) {
    console.error('❌ Join waiting room error:', error);
    logActivity('Join waiting room error', { error: error.message, proxyId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}