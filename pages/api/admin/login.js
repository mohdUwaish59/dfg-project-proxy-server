// Admin login API route for Vercel
const { getDatabase } = require('../../../src/database');
const { setAuthCookie, clearAuthCookie } = require('../../../src/auth/jwt-auth');
const { logActivity } = require('../../../src/utils');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔍 Admin login attempt started');
  console.log('🔍 Request body:', { username: req.body.username, password: '***' });
  
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    console.log('❌ Missing username or password');
    logActivity('Admin login failed', { username: username || 'missing', reason: 'missing_credentials', ip: req.ip });
    
    clearAuthCookie(res);
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    console.log('🔍 Getting database connection...');
    
    // Initialize database if needed
    try {
      const { initDatabase } = require('../../../src/database');
      await initDatabase();
    } catch (initError) {
      console.log('ℹ️ Database already initialized or initialization not needed');
    }
    
    const db = getDatabase();
    console.log('✅ Database connection obtained');
    
    // First, check if the user exists in the database
    console.log('🔍 Checking if user exists...');
    
    const userRow = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
    
    // If user doesn't exist in database
    if (!userRow) {
      console.log('❌ User not found in database:', username);
      logActivity('Admin login failed', { username, reason: 'user_not_found', ip: req.ip });
      
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // User exists, now check password
    console.log('🔍 User found, checking password...');
    if (userRow.password !== password) {
      console.log('❌ Invalid password for user:', username);
      logActivity('Admin login failed', { username, reason: 'invalid_password', ip: req.ip });
      
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Both username and password are correct
    console.log('🔍 Setting JWT authentication...');
    
    setAuthCookie(res, {
      username: username,
      adminLoggedIn: true
    });
    
    logActivity('Admin login successful', { username });
    console.log('✅ Login successful, JWT cookie set');
    
    return res.json({ success: true, user: { username } });
    
  } catch (dbError) {
    console.error('❌ Database error during user lookup:', dbError);
    logActivity('Admin login error', { error: dbError.message, username });
    return res.status(500).json({ 
      error: 'Database error',
      details: dbError.message
    });
  }
}