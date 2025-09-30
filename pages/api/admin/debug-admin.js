// Debug admin API route for Next.js
const { getAllAdmins } = require('../../../lib/database');
const { getTokenFromRequest } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allAdmins = await getAllAdmins();
    console.log('🔍 All admins in database:', allAdmins);
    
    const adminUser = allAdmins.find(admin => admin.username === 'admin');
    
    res.json({ 
      adminExists: !!adminUser,
      adminData: adminUser ? { username: adminUser.username, created_at: adminUser.created_at } : null,
      authToken: !!getTokenFromRequest(req),
      allAdmins: allAdmins.map(admin => ({ username: admin.username, created_at: admin.created_at }))
    });
  } catch (error) {
    console.error('🔍 Debug admin error:', error);
    res.json({ error: error.message, stack: error.stack });
  }
}