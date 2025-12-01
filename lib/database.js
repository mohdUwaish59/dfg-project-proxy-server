// Pure Next.js database module (MongoDB only)
const { MongoClient, ServerApiVersion } = require('mongodb');

let client = null;
let db = null;
let isConnected = false;

async function connectToDatabase() {
  if (isConnected && db) {
    return db;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  try {
    client = new MongoClient(process.env.DATABASE_URL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    db = client.db('otree_proxy');
    isConnected = true;

    // Test the connection
    await client.db("admin").command({ ping: 1 });

    // Create indexes
    await createIndexes();

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    await db.collection('admins').createIndex({ username: 1 }, { unique: true });
    await db.collection('proxy_links').createIndex({ proxy_id: 1 }, { unique: true });
    await db.collection('link_usage').createIndex({ proxy_id: 1, user_fingerprint: 1 }, { unique: true });
  } catch (error) {
    console.log('ℹ️ MongoDB indexes may already exist:', error.message);
  }
}

// Database operations
async function findAdmin(username) {
  const database = await connectToDatabase();
  return await database.collection('admins').findOne({ username });
}

async function findAdminWithPassword(username, password) {
  const database = await connectToDatabase();
  return await database.collection('admins').findOne({ username, password });
}

async function getAllAdmins() {
  const database = await connectToDatabase();
  return await database.collection('admins').find({}).toArray();
}

async function createAdmin(username, password) {
  const database = await connectToDatabase();
  return await database.collection('admins').insertOne({
    username,
    password,
    created_at: new Date()
  });
}

async function getAllProxyLinks() {
  const database = await connectToDatabase();
  const links = await database.collection('proxy_links').find({}).sort({ created_at: -1 }).toArray();
  
  // Convert MongoDB format to frontend-compatible format
  return links.map((link, index) => ({
    id: link._id ? link._id.toString() : index + 1,
    proxy_id: link.proxy_id,
    real_url: link.real_url,
    group_name: link.group_name,
    otree_session_id: link.otree_session_id || null,
    category: link.category || null,
    treatment_title: link.treatment_title || null,
    post_experiment_redirect_url: link.post_experiment_redirect_url || null,
    max_uses: link.max_uses || 3,
    current_uses: link.current_uses || 0,
    is_active: link.is_active !== false,
    status: link.status || 'active', // active, used, inactive
    completed_at: link.completed_at,
    created_at: link.created_at instanceof Date ? link.created_at.toISOString() : (link.created_at || new Date().toISOString()),
    created_by: link.created_by || 'admin'
  }));
}

async function getProxyLink(proxyId) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').findOne({ proxy_id: proxyId });
}

async function getActiveProxyLink(proxyId) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').findOne({ 
    proxy_id: proxyId, 
    is_active: { $ne: false }
  });
}

async function createProxyLink(proxyId, realUrl, groupName, maxUses = 200, category = null, treatmentTitle = null, postExperimentRedirectUrl = null, otreeSessionId = null) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').insertOne({
    proxy_id: proxyId,
    real_url: realUrl,
    group_name: groupName,
    otree_session_id: otreeSessionId, // oTree session identifier
    category: category, // No Gender, All Male, All Female, Mixed
    treatment_title: treatmentTitle, // Treatment 1-4 options
    post_experiment_redirect_url: postExperimentRedirectUrl, // Link-specific post-experiment redirect
    max_uses: maxUses, // Total room capacity (default 200)
    group_size: 3, // Size of each group (fixed at 3)
    current_uses: 0,
    groups_formed: 0, // Number of groups formed so far
    is_active: true,
    created_at: new Date(),
    created_by: 'admin'
  });
}

async function updateProxyLinkStatus(proxyId, isActive) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').updateOne(
    { proxy_id: proxyId },
    { $set: { is_active: isActive } }
  );
}

async function incrementProxyLinkUsage(proxyId) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').updateOne(
    { proxy_id: proxyId },
    { $inc: { current_uses: 1 } }
  );
}

async function resetProxyLinkUsage(proxyId) {
  const database = await connectToDatabase();
  await database.collection('proxy_links').updateOne(
    { proxy_id: proxyId },
    { $set: { current_uses: 0 } }
  );
  return await database.collection('link_usage').deleteMany({ proxy_id: proxyId });
}

async function updatePostExperimentRedirectUrl(proxyId, redirectUrl) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').updateOne(
    { proxy_id: proxyId },
    { $set: { post_experiment_redirect_url: redirectUrl } }
  );
}

async function deleteProxyLink(proxyId) {
  const database = await connectToDatabase();
  await database.collection('link_usage').deleteMany({ proxy_id: proxyId });
  return await database.collection('proxy_links').deleteOne({ proxy_id: proxyId });
}

async function checkLinkUsage(proxyId, userFingerprint) {
  const database = await connectToDatabase();
  const result = await database.collection('link_usage').findOne({ 
    proxy_id: proxyId, 
    user_fingerprint: userFingerprint 
  });
  
  return result;
}

async function recordLinkUsage(proxyId, sessionId, userIp, userFingerprint, participantNumber, gender = null, prolificPid = null) {
  const database = await connectToDatabase();
  const joinedAt = new Date();
  return await database.collection('link_usage').insertOne({
    proxy_id: proxyId,
    session_id: sessionId,
    user_ip: userIp,
    user_fingerprint: userFingerprint,
    participant_number: participantNumber,
    gender: gender,              // "MALE" | "FEMALE" | "OTHER" | null
    prolific_pid: prolificPid,   // Prolific participant ID
    status: 'waiting', // waiting, redirected, expired
    group_session_id: null, // Will be set when group is formed
    joined_at: joinedAt,
    participant_timer_start: joinedAt, // Individual 10-minute timer start
    participant_timer_expired: false,
    redirected_at: null,
    used_at: new Date()
  });
}

// New functions for group management
async function getWaitingParticipants(proxyId) {
  const database = await connectToDatabase();
  
  // First, expire any participants whose timers have run out
  await expireTimedOutParticipants(proxyId);
  
  return await database.collection('link_usage').find({ 
    proxy_id: proxyId, 
    status: 'waiting' 
  }).sort({ joined_at: 1 }).toArray();
}

// Get waiting participants by gender (FIFO order)
async function getWaitingParticipantsByGender(proxyId, gender) {
  const database = await connectToDatabase();
  
  // First, expire any participants whose timers have run out
  await expireTimedOutParticipants(proxyId);
  
  return await database.collection('link_usage').find({ 
    proxy_id: proxyId, 
    status: 'waiting',
    gender: gender
  }).sort({ joined_at: 1 }).toArray();
}

// Automatically expire participants whose 10-minute timer has run out
async function expireTimedOutParticipants(proxyId) {
  const database = await connectToDatabase();
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 600000); // 10 minutes = 600,000 ms
  
  // Find all waiting participants whose timer started more than 10 minutes ago
  const result = await database.collection('link_usage').updateMany(
    {
      proxy_id: proxyId,
      status: 'waiting',
      participant_timer_start: { $lte: tenMinutesAgo },
      participant_timer_expired: false
    },
    {
      $set: {
        status: 'expired',
        participant_timer_expired: true
      }
    }
  );
  
  return result.modifiedCount;
}

// Get the last mixed group type for alternating strategy
async function getLastMixedGroupType(proxyId) {
  const database = await connectToDatabase();
  
  // Find the most recent redirected group
  const lastGroup = await database.collection('link_usage').findOne(
    {
      proxy_id: proxyId,
      status: 'redirected',
      group_type: { $exists: true }
    },
    {
      sort: { redirected_at: -1 }
    }
  );
  
  return lastGroup?.group_type || '1M_2F'; // Default to 1M:2F if no previous group
}

async function getAllParticipants(proxyId) {
  const database = await connectToDatabase();
  return await database.collection('link_usage').find({ 
    proxy_id: proxyId 
  }).sort({ joined_at: 1 }).toArray();
}

async function updateParticipantStatus(proxyId, userFingerprint, status, groupSessionId = null) {
  const database = await connectToDatabase();
  const updateData = { 
    status,
    ...(status === 'redirected' && { redirected_at: new Date() }),
    ...(groupSessionId && { group_session_id: groupSessionId })
  };
  
  return await database.collection('link_usage').updateOne(
    { proxy_id: proxyId, user_fingerprint: userFingerprint },
    { $set: updateData }
  );
}

async function createGroupSession(proxyId, participantFingerprints, groupType = null) {
  const database = await connectToDatabase();
  const groupSessionId = require('crypto').randomBytes(16).toString('hex');
  
  // Prepare update data
  const updateData = { 
    group_session_id: groupSessionId,
    status: 'redirected',
    redirected_at: new Date()
  };
  
  // Add group type if provided (for mixed gender groups)
  if (groupType) {
    updateData.group_type = groupType;
  }
  
  // Update selected participants with the group session ID
  const updateResult = await database.collection('link_usage').updateMany(
    { 
      proxy_id: proxyId, 
      user_fingerprint: { $in: participantFingerprints }
    },
    { 
      $set: updateData
    }
  );
  
  // Increment groups_formed counter (don't mark as "used" - room stays open)
  await database.collection('proxy_links').updateOne(
    { proxy_id: proxyId },
    { 
      $inc: { 
        groups_formed: 1,
        current_uses: participantFingerprints.length
      }
    }
  );
  
  return groupSessionId;
}

// Check if a gender-based group can be formed
async function canFormGenderBasedGroup(proxyId, category, groupSize) {
  const database = await connectToDatabase();
  
  if (!category || category === 'No Gender') {
    // No gender requirement - use count-based logic
    const waitingParticipants = await getWaitingParticipants(proxyId);
    const canForm = waitingParticipants.length >= groupSize;
    return {
      canForm,
      participants: canForm ? waitingParticipants.slice(0, groupSize) : []
    };
  }
  
  if (category === 'All Male') {
    const maleParticipants = await getWaitingParticipantsByGender(proxyId, 'MALE');
    const canForm = maleParticipants.length >= groupSize;
    return {
      canForm,
      participants: canForm ? maleParticipants.slice(0, groupSize) : []
    };
  }
  
  if (category === 'All Female') {
    const femaleParticipants = await getWaitingParticipantsByGender(proxyId, 'FEMALE');
    const canForm = femaleParticipants.length >= groupSize;
    return {
      canForm,
      participants: canForm ? femaleParticipants.slice(0, groupSize) : []
    };
  }
  
  if (category === 'Mixed') {
    // Mixed gender logic: 2M:1F or 1M:2F
    const maleParticipants = await getWaitingParticipantsByGender(proxyId, 'MALE');
    const femaleParticipants = await getWaitingParticipantsByGender(proxyId, 'FEMALE');
    
    const maleCount = maleParticipants.length;
    const femaleCount = femaleParticipants.length;
    
    // Check if we can form any group
    const canForm2M1F = (maleCount >= 2 && femaleCount >= 1);
    const canForm1M2F = (maleCount >= 1 && femaleCount >= 2);
    
    if (!canForm2M1F && !canForm1M2F) {
      return {
        canForm: false,
        participants: [],
        groupType: null
      };
    }
    
    // Determine group type using balancing strategy
    let groupType;
    let selectedParticipants = [];
    
    if (canForm2M1F && canForm1M2F) {
      // Both configurations possible - use balancing strategy
      if (maleCount >= femaleCount * 2) {
        // Many more males waiting - prioritize 2M:1F
        groupType = '2M_1F';
        selectedParticipants = [
          maleParticipants[0],
          maleParticipants[1],
          femaleParticipants[0]
        ];
      } else if (femaleCount >= maleCount * 2) {
        // Many more females waiting - prioritize 1M:2F
        groupType = '1M_2F';
        selectedParticipants = [
          maleParticipants[0],
          femaleParticipants[0],
          femaleParticipants[1]
        ];
      } else {
        // Roughly balanced - alternate based on last group
        const lastGroupType = await getLastMixedGroupType(proxyId);
        if (lastGroupType === '2M_1F') {
          groupType = '1M_2F';
          selectedParticipants = [
            maleParticipants[0],
            femaleParticipants[0],
            femaleParticipants[1]
          ];
        } else {
          groupType = '2M_1F';
          selectedParticipants = [
            maleParticipants[0],
            maleParticipants[1],
            femaleParticipants[0]
          ];
        }
      }
    } else if (canForm2M1F) {
      // Only 2M:1F possible
      groupType = '2M_1F';
      selectedParticipants = [
        maleParticipants[0],
        maleParticipants[1],
        femaleParticipants[0]
      ];
    } else {
      // Only 1M:2F possible
      groupType = '1M_2F';
      selectedParticipants = [
        maleParticipants[0],
        femaleParticipants[0],
        femaleParticipants[1]
      ];
    }
    
    return {
      canForm: true,
      participants: selectedParticipants,
      groupType: groupType
    };
  }
  
  return {
    canForm: false,
    participants: []
  };
}

async function getGroupStatus(proxyId) {
  const database = await connectToDatabase();
  const link = await database.collection('proxy_links').findOne({ proxy_id: proxyId });
  if (!link) return null;
  
  const waitingParticipants = await getWaitingParticipants(proxyId);
  const allParticipants = await database.collection('link_usage').find({ proxy_id: proxyId }).toArray();
  const redirectedParticipants = allParticipants.filter(p => p.status === 'redirected');
  const expiredParticipants = allParticipants.filter(p => p.status === 'expired');
  
  const totalJoined = allParticipants.length;
  const isGroupComplete = totalJoined >= link.max_uses;
  const hasRedirectedGroup = redirectedParticipants.length > 0;
  
  return {
    proxy_id: proxyId,
    group_name: link.group_name,
    category: link.category,
    treatment_title: link.treatment_title,
    max_uses: link.max_uses,
    current_waiting: waitingParticipants.length,
    total_joined: totalJoined,
    is_full: isGroupComplete,
    has_redirected_group: hasRedirectedGroup,
    waiting_participants: waitingParticipants.map(p => ({
      participant_number: p.participant_number,
      joined_at: p.joined_at,
      fingerprint: p.user_fingerprint.substring(0, 8) + '...' // Partial for privacy
    })),
    redirected_participants: redirectedParticipants.map(p => ({
      participant_number: p.participant_number,
      redirected_at: p.redirected_at,
      group_session_id: p.group_session_id
    })),
    expired_participants: expiredParticipants.map(p => ({
      participant_number: p.participant_number,
      joined_at: p.joined_at,
      fingerprint: p.user_fingerprint.substring(0, 8) + '...'
    })),
    real_url: link.real_url
  };
}

// Participant timing functions
async function checkParticipantExpiration(proxyId, userFingerprint) {
  const database = await connectToDatabase();
  const participant = await database.collection('link_usage').findOne({ 
    proxy_id: proxyId, 
    user_fingerprint: userFingerprint 
  });
  
  if (!participant || !participant.participant_timer_start) {
    return { expired: false, timeLeft: 600, timerStart: null };
  }
  
  // If already redirected, no expiration
  if (participant.status === 'redirected') {
    return { expired: false, timeLeft: 0, timerStart: participant.participant_timer_start.getTime(), isRedirected: true };
  }
  
  // If already marked as expired
  if (participant.participant_timer_expired || participant.status === 'expired') {
    return { expired: true, timeLeft: 0, timerStart: participant.participant_timer_start.getTime() };
  }
  
  const now = new Date();
  const elapsed = Math.floor((now - participant.participant_timer_start) / 1000);
  const timeLeft = Math.max(0, 600 - elapsed); // 10 minutes = 600 seconds
  
  if (timeLeft <= 0) {
    // Participant timer has expired, mark them as expired
    await database.collection('link_usage').updateOne(
      { proxy_id: proxyId, user_fingerprint: userFingerprint },
      { 
        $set: { 
          participant_timer_expired: true,
          status: 'expired'
        }
      }
    );
    return { expired: true, timeLeft: 0, timerStart: participant.participant_timer_start.getTime() };
  }
  
  return { 
    expired: false, 
    timeLeft, 
    timerStart: participant.participant_timer_start.getTime() 
  };
}

async function expireParticipant(proxyId, userFingerprint) {
  const database = await connectToDatabase();
  return await database.collection('link_usage').updateOne(
    { proxy_id: proxyId, user_fingerprint: userFingerprint },
    { 
      $set: { 
        participant_timer_expired: true,
        status: 'expired'
      }
    }
  );
}

async function getProxyStats() {
  const database = await connectToDatabase();
  const links = await database.collection('proxy_links').find({}).toArray();
  
  const total = links.length;
  const active = links.filter(link => link.is_active !== false && link.status !== 'used' && link.status !== 'expired').length;
  const participants = links.reduce((sum, link) => sum + (link.current_uses || 0), 0);
  const full = links.filter(link => (link.current_uses || 0) >= (link.max_uses || 3)).length;
  const used = links.filter(link => link.status === 'used').length;
  const expired = links.filter(link => link.status === 'expired').length;

  return { total, active, participants, full, used, expired };
}

module.exports = {
  connectToDatabase,
  findAdmin,
  findAdminWithPassword,
  getAllAdmins,
  createAdmin,
  getAllProxyLinks,
  getProxyLink,
  getActiveProxyLink,
  createProxyLink,
  updateProxyLinkStatus,
  incrementProxyLinkUsage,
  resetProxyLinkUsage,
  updatePostExperimentRedirectUrl,
  deleteProxyLink,
  checkLinkUsage,
  recordLinkUsage,
  getProxyStats,
  // New group management functions
  getWaitingParticipants,
  getWaitingParticipantsByGender,
  updateParticipantStatus,
  createGroupSession,
  getGroupStatus,
  canFormGenderBasedGroup,
  getAllParticipants,
  // Participant timing functions
  checkParticipantExpiration,
  expireParticipant,
  expireTimedOutParticipants,
  getLastMixedGroupType
};