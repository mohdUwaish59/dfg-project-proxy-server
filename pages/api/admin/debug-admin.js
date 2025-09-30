// Debug admin API route for Vercel
const { getDatabase } = require('../../../src/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../src/database');
      await initDatabase();
    } catch (initError) {
      console.log('ℹ️ Database already initialized or initialization not needed');
    }
    
    const db = getDatabase();
    
    // Check all admins in database
    const allAdmins = await db.all('SELECT * FROM admins');
    console.log('🔍 All admins in database:', allAdmins);
    
    // Check specific admin
    const result = await db.get('SELECT * FROM admins WHERE username = ?', ['admin']);
    console.log('🔍 Admin user lookup result:', result);
    
    res.json({ 
      adminExists: !!result,
      adminData: result ? { username: result.username, created_at: result.created_at } : null,
      authToken: !!req.cookies['auth-token'],
      allAdmins: allAdmins.map(admin => ({ username: admin.username, created_at: admin.created_at }))
    });
  } catch (error) {
    console.error('🔍 Debug admin error:', error);
    res.json({ error: error.message, stack: error.stack });
  }
}