const express = require('express');
const { getDatabase } = require('../database');
const { generateProxyId, isValidUrl, sanitizeInput, logActivity } = require('../utils');
const { renderAdminPage } = require('../views/adminView');
const { setAuthCookie, clearAuthCookie, requireAuth, verifyToken } = require('../auth/jwt-auth');

const router = express.Router();

// Admin login page and dashboard
router.get('/', (req, res) => {
  console.log('🔍 Admin dashboard accessed');
  
  // Check JWT authentication
  const token = req.cookies['auth-token'];
  const user = verifyToken(token);
  const isLoggedIn = !!user;
  
  console.log('🔍 Auth token exists:', !!token);
  console.log('🔍 User verified:', !!user);
  console.log('🔍 Logged in status:', isLoggedIn);
  
  res.send(renderAdminPage(isLoggedIn));
});

// Debug endpoint to check admin user (remove in production)
router.get('/debug-admin', async (req, res) => {
  try {
    const db = getDatabase();
    const result = await db.get('SELECT * FROM admins WHERE username = ?', ['admin']);
    res.json({ 
      adminExists: !!result,
      adminData: result ? { username: result.username, created_at: result.created_at } : null,
      authToken: !!req.cookies['auth-token']
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Debug endpoint to check links data (remove in production)
router.get('/debug-links', requireAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const links = await db.all('SELECT * FROM proxy_links ORDER BY created_at DESC');
    res.json({ 
      count: links.length,
      links: links
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  console.log('🔍 Admin login attempt started');
  console.log('🔍 Request body:', { username: req.body.username, password: '***' });
  
  const { username, password } = req.body;
  
  try {
    console.log('🔍 Getting database connection...');
    const db = getDatabase();
    console.log('✅ Database connection obtained');
    
    console.log('🔍 Executing login query...');
    db.get('SELECT * FROM admins WHERE username = ? AND password = ?', 
      [username, password], (err, row) => {
        console.log('🔍 Login query callback called');
        
        if (err) {
          console.error('❌ Database error during login:', err);
          console.error('❌ Error details:', {
            message: err.message,
            code: err.code,
            stack: err.stack
          });
          logActivity('Admin login error', { error: err.message });
          return res.status(500).json({ 
            error: 'Database error',
            details: err.message,
            code: err.code
          });
        }
        
        console.log('🔍 Query result:', row ? 'User found' : 'User not found');
        
        if (row) {
          console.log('🔍 Setting JWT authentication...');
          
          // Set JWT cookie instead of session
          setAuthCookie(res, {
            username: username,
            adminLoggedIn: true
          });
          
          logActivity('Admin login successful', { username });
          console.log('✅ Login successful, JWT cookie set, redirecting...');
          res.redirect('/admin');
        } else {
          logActivity('Admin login failed', { username, ip: req.ip });
          console.log('❌ Invalid credentials');
          res.redirect('/admin?error=invalid');
        }
      });
  } catch (error) {
    console.error('❌ Unexpected error during login:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Unexpected error',
      details: error.message
    });
  }
});

// Admin logout
router.post('/logout', (req, res) => {
  const token = req.cookies['auth-token'];
  const user = verifyToken(token);
  const username = user?.username || 'unknown';
  
  clearAuthCookie(res);
  logActivity('Admin logout', { username });
  console.log('✅ User logged out, JWT cookie cleared');
  res.redirect('/admin');
});

// Create proxy link
router.post('/create-link', requireAuth, (req, res) => {
  const { realUrl, groupName } = req.body;
  const maxUses = 3; // Fixed for oTree experiments
  const db = getDatabase();
  
  // Validate input
  if (!isValidUrl(realUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const sanitizedGroupName = sanitizeInput(groupName);
  const proxyId = generateProxyId();
  
  db.run('INSERT INTO proxy_links (proxy_id, real_url, group_name, max_uses, current_uses) VALUES (?, ?, ?, ?, 0)', 
    [proxyId, realUrl, sanitizedGroupName || null, maxUses], function(err) {
      if (err) {
        logActivity('Create link error', { error: err.message, groupName: sanitizedGroupName });
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      logActivity('Link created', { 
        proxyId, 
        groupName: sanitizedGroupName, 
        admin: req.user.username 
      });
      
      res.redirect('/admin');
    });
});

// Get all proxy links
router.get('/links', requireAuth, async (req, res) => {
  try {
    console.log('🔍 /admin/links endpoint called');
    const db = getDatabase();
    const rows = await db.all('SELECT * FROM proxy_links ORDER BY created_at DESC');
    console.log('🔍 /admin/links returning:', rows.length, 'links');
    console.log('🔍 First link:', rows[0]);
    res.json(rows);
  } catch (err) {
    console.error('❌ Get links error:', err);
    logActivity('Get links error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get admin stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    console.log('🔍 /admin/stats endpoint called');
    const db = getDatabase();
    const result = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(current_uses) as participants,
        SUM(CASE WHEN current_uses >= max_uses THEN 1 ELSE 0 END) as full
      FROM proxy_links
    `);
    console.log('🔍 /admin/stats returning:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ Get stats error:', err);
    logActivity('Get stats error', { error: err.message });
    return res.status(500).json({ error: 'Database error' });
  }
});

// Toggle link activation
router.post('/toggle-link', requireAuth, (req, res) => {
  const { proxyId, activate } = req.body;
  const db = getDatabase();
  
  db.run('UPDATE proxy_links SET is_active = ? WHERE proxy_id = ?', 
    [activate ? 1 : 0, proxyId], function(err) {
      if (err) {
        logActivity('Toggle link error', { error: err.message, proxyId });
        return res.status(500).json({ error: 'Database error' });
      }
      
      logActivity('Link toggled', { 
        proxyId, 
        activate, 
        admin: req.user.username 
      });
      
      res.json({ success: true });
    });
});

// Reset link usage
router.post('/reset-usage', requireAuth, (req, res) => {
  const { proxyId } = req.body;
  const db = getDatabase();
  
  db.serialize(() => {
    // Reset current_uses to 0
    db.run('UPDATE proxy_links SET current_uses = 0 WHERE proxy_id = ?', [proxyId]);
    
    // Delete all usage records for this link
    db.run('DELETE FROM link_usage WHERE proxy_id = ?', [proxyId], function(err) {
      if (err) {
        logActivity('Reset usage error', { error: err.message, proxyId });
        return res.status(500).json({ error: 'Database error' });
      }
      
      logActivity('Usage reset', { 
        proxyId, 
        admin: req.user.username 
      });
      
      res.json({ success: true });
    });
  });
});

// Delete link (POST method for frontend compatibility)
router.post('/delete-link', requireAuth, (req, res) => {
  const { proxyId } = req.body;
  const db = getDatabase();
  
  if (!proxyId) {
    return res.status(400).json({ error: 'Proxy ID is required' });
  }
  
  db.serialize(() => {
    // Delete usage records first
    db.run('DELETE FROM link_usage WHERE proxy_id = ?', [proxyId]);
    
    // Delete the link
    db.run('DELETE FROM proxy_links WHERE proxy_id = ?', [proxyId], function(err) {
      if (err) {
        logActivity('Delete link error', { error: err.message, proxyId });
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      logActivity('Link deleted', { 
        proxyId, 
        admin: req.user.username 
      });
      
      res.json({ success: true });
    });
  });
});

// Delete link (DELETE method - keeping for API consistency)
router.delete('/delete-link/:proxyId', requireAuth, (req, res) => {
  const { proxyId } = req.params;
  const db = getDatabase();
  
  db.serialize(() => {
    // Delete usage records first
    db.run('DELETE FROM link_usage WHERE proxy_id = ?', [proxyId]);
    
    // Delete the link
    db.run('DELETE FROM proxy_links WHERE proxy_id = ?', [proxyId], function(err) {
      if (err) {
        logActivity('Delete link error', { error: err.message, proxyId });
        return res.status(500).json({ error: 'Database error' });
      }
      
      logActivity('Link deleted', { 
        proxyId, 
        admin: req.user.username 
      });
      
      res.json({ success: true });
    });
  });
});

module.exports = router;