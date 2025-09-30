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
    console.log('🔍 Connecting to MongoDB...');
    
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
    console.log('✅ MongoDB connected successfully');

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
    console.log('✅ MongoDB indexes created');
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
    category: link.category || null,
    treatment_title: link.treatment_title || null,
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

async function createProxyLink(proxyId, realUrl, groupName, maxUses = 3, category = null, treatmentTitle = null) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').insertOne({
    proxy_id: proxyId,
    real_url: realUrl,
    group_name: groupName,
    category: category, // No Gender, All Male, All Female, Mixed
    treatment_title: treatmentTitle, // Treatment 1-4 options
    max_uses: maxUses,
    current_uses: 0,
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

async function deleteProxyLink(proxyId) {
  const database = await connectToDatabase();
  await database.collection('link_usage').deleteMany({ proxy_id: proxyId });
  return await database.collection('proxy_links').deleteOne({ proxy_id: proxyId });
}

async function checkLinkUsage(proxyId, userFingerprint) {
  const database = await connectToDatabase();
  return await database.collection('link_usage').findOne({ 
    proxy_id: proxyId, 
    user_fingerprint: userFingerprint 
  });
}

async function recordLinkUsage(proxyId, sessionId, userIp, userFingerprint, participantNumber) {
  const database = await connectToDatabase();
  return await database.collection('link_usage').insertOne({
    proxy_id: proxyId,
    session_id: sessionId,
    user_ip: userIp,
    user_fingerprint: userFingerprint,
    participant_number: participantNumber,
    status: 'waiting', // waiting, redirected
    group_session_id: null, // Will be set when group is formed
    joined_at: new Date(),
    redirected_at: null,
    used_at: new Date()
  });
}

// New functions for group management
async function getWaitingParticipants(proxyId) {
  const database = await connectToDatabase();
  return await database.collection('link_usage').find({ 
    proxy_id: proxyId, 
    status: 'waiting' 
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

async function createGroupSession(proxyId, participantFingerprints) {
  const database = await connectToDatabase();
  const groupSessionId = require('crypto').randomBytes(16).toString('hex');
  
  // Update all participants with the group session ID
  await database.collection('link_usage').updateMany(
    { 
      proxy_id: proxyId, 
      user_fingerprint: { $in: participantFingerprints },
      status: 'waiting'
    },
    { 
      $set: { 
        group_session_id: groupSessionId,
        status: 'redirected',
        redirected_at: new Date()
      }
    }
  );
  
  // Mark the proxy link as used/completed when all participants are redirected
  await database.collection('proxy_links').updateOne(
    { proxy_id: proxyId },
    { 
      $set: { 
        status: 'used',
        completed_at: new Date(),
        current_uses: participantFingerprints.length
      }
    }
  );
  
  return groupSessionId;
}

async function getGroupStatus(proxyId) {
  const database = await connectToDatabase();
  const link = await getActiveProxyLink(proxyId);
  if (!link) return null;
  
  const waitingParticipants = await getWaitingParticipants(proxyId);
  const allParticipants = await database.collection('link_usage').find({ proxy_id: proxyId }).toArray();
  const redirectedParticipants = allParticipants.filter(p => p.status === 'redirected');
  
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
    real_url: link.real_url
  };
}

async function getProxyStats() {
  const database = await connectToDatabase();
  const links = await database.collection('proxy_links').find({}).toArray();
  
  const total = links.length;
  const active = links.filter(link => link.is_active !== false && link.status !== 'used').length;
  const participants = links.reduce((sum, link) => sum + (link.current_uses || 0), 0);
  const full = links.filter(link => (link.current_uses || 0) >= (link.max_uses || 3)).length;
  const used = links.filter(link => link.status === 'used').length;

  return { total, active, participants, full, used };
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
  deleteProxyLink,
  checkLinkUsage,
  recordLinkUsage,
  getProxyStats,
  // New group management functions
  getWaitingParticipants,
  updateParticipantStatus,
  createGroupSession,
  getGroupStatus
};