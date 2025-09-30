// Debug API to check database state
const { getGroupStatus, getWaitingParticipants } = require('../../../../lib/database');
const { connectToDatabase } = require('../../../../lib/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: proxyId } = req.query;

  try {
    const database = await connectToDatabase();
    
    // Get all participants for this proxy
    const allParticipants = await database.collection('link_usage').find({ proxy_id: proxyId }).toArray();
    const waitingParticipants = await getWaitingParticipants(proxyId);
    const groupStatus = await getGroupStatus(proxyId);

    return res.json({
      proxyId,
      allParticipants: allParticipants.map(p => ({
        participant_number: p.participant_number,
        status: p.status,
        joined_at: p.joined_at,
        redirected_at: p.redirected_at,
        group_session_id: p.group_session_id,
        fingerprint: p.user_fingerprint.substring(0, 8) + '...'
      })),
      waitingCount: waitingParticipants.length,
      groupStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({ error: error.message });
  }
}