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
    max_uses: link.max_uses || 3,
    current_uses: link.current_uses || 0,
    is_active: link.is_active !== false,
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

async function createProxyLink(proxyId, realUrl, groupName, maxUses = 3) {
  const database = await connectToDatabase();
  return await database.collection('proxy_links').insertOne({
    proxy_id: proxyId,
    real_url: realUrl,
    group_name: groupName,
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
    used_at: new Date()
  });
}

async function getProxyStats() {
  const database = await connectToDatabase();
  const links = await database.collection('proxy_links').find({}).toArray();
  
  const total = links.length;
  const active = links.filter(link => link.is_active !== false).length;
  const participants = links.reduce((sum, link) => sum + (link.current_uses || 0), 0);
  const full = links.filter(link => (link.current_uses || 0) >= (link.max_uses || 3)).length;

  return { total, active, participants, full };
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
  getProxyStats
};