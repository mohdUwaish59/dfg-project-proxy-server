const express = require('express');
const { getDatabase } = require('../database');
const { generateProxyId, isValidUrl, requireAdmin, sanitizeInput, logActivity } = require('../utils');
const { renderAdminPage } = require('../views/adminView');

const router = express.Router();

// Admin login page and dashboard
router.get('/', (req, res) => {
  res.send(renderAdminPage(req.session.adminLoggedIn));
});

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDatabase();
  
  db.get('SELECT * FROM admins WHERE username = ? AND password = ?', 
    [username, password], (err, row) => {
      if (err) {
        logActivity('Admin login error', { error: err.message });
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        req.session.adminLoggedIn = true;
        req.session.adminUsername = username;
        logActivity('Admin login successful', { username });
        res.redirect('/admin');
      } else {
        logActivity('Admin login failed', { username, ip: req.ip });
        res.redirect('/admin?error=invalid');
      }
    });
});

// Admin logout
router.post('/logout', (req, res) => {
  const username = req.session.adminUsername;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    logActivity('Admin logout', { username });
    res.redirect('/admin');
  });
});

// Create proxy link
router.post('/create-link', requireAdmin, (req, res) => {
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
        admin: req.session.adminUsername 
      });
      
      res.redirect('/admin');
    });
});

// Get all proxy links
router.get('/links', requireAdmin, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM proxy_links ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logActivity('Get links error', { error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get admin stats
router.get('/stats', requireAdmin, (req, res) => {
  const db = getDatabase();

  db.all(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
      SUM(current_uses) as participants,
      SUM(CASE WHEN current_uses >= max_uses THEN 1 ELSE 0 END) as full
    FROM proxy_links
  `, (err, rows) => {
    if (err) {
      logActivity('Get stats error', { error: err.message });
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows[0]);
  });
});

// Toggle link activation
router.post('/toggle-link', requireAdmin, (req, res) => {
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
        admin: req.session.adminUsername 
      });
      
      res.json({ success: true });
    });
});

// Reset link usage
router.post('/reset-usage', requireAdmin, (req, res) => {
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
        admin: req.session.adminUsername 
      });
      
      res.json({ success: true });
    });
  });
});

// Delete link (POST method for frontend compatibility)
router.post('/delete-link', requireAdmin, (req, res) => {
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
        admin: req.session.adminUsername 
      });
      
      res.json({ success: true });
    });
  });
});

// Delete link (DELETE method - keeping for API consistency)
router.delete('/delete-link/:proxyId', requireAdmin, (req, res) => {
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
        admin: req.session.adminUsername 
      });
      
      res.json({ success: true });
    });
  });
});

module.exports = router;