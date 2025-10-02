// API endpoint for redirect analytics
const { connectToDatabase } = require('../../../lib/database');

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    
    if (req.method === 'GET') {
      // Get redirect statistics
      const logs = await db.collection('redirect_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray();
      
      const stats = {
        total: logs.length,
        male: logs.filter(log => log.gender === 'male').length,
        female: logs.filter(log => log.gender === 'female').length,
        recent: logs.slice(0, 10).map(log => ({
          gender: log.gender,
          timestamp: log.timestamp,
          redirected_to: log.redirected_to
        }))
      };
      
      res.status(200).json(stats);
      
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Redirect analytics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}