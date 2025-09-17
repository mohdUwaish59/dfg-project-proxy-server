const express = require('express');
const { getDatabase } = require('../database');
const { getClientIP, logActivity } = require('../utils');
const { 
  renderLinkNotFound, 
  renderExperimentFull, 
  renderAlreadyParticipated, 
  renderJoinPage 
} = require('../views/proxyView');

const router = express.Router();

// Main proxy route - shows the intermediate page
router.get('/:proxyId', async (req, res) => {
  try {
    const { proxyId } = req.params;
    
    // Ensure session is initialized
    if (!req.session.initialized) {
      req.session.initialized = true;
    }
    
    const sessionId = req.session.id || 'no-session';
    const userIp = getClientIP(req);
    const db = getDatabase();

    logActivity('Proxy access attempt', { proxyId, sessionId, userIp });
    console.log('🔍 Proxy GET request for:', proxyId);

    // Check if link exists and is active
    const link = await db.get('SELECT * FROM proxy_links WHERE proxy_id = ? AND is_active = ?', [proxyId, true]);
    
    if (!link) {
      logActivity('Link not found or inactive', { proxyId });
      return res.status(404).send(renderLinkNotFound());
    }

    console.log('🔍 Link found:', link.group_name, 'Usage:', link.current_uses, '/', link.max_uses);

    // Check if link has reached maximum usage
    if (link.current_uses >= link.max_uses) {
      logActivity('Experiment full', { proxyId, groupName: link.group_name });
      return res.send(renderExperimentFull(link));
    }

    // Show the join page
    const remainingSpots = link.max_uses - link.current_uses;
    logActivity('Showing join page', { 
      proxyId, 
      groupName: link.group_name, 
      remainingSpots 
    });
    
    console.log('✅ Showing join page for:', link.group_name, 'Remaining spots:', remainingSpots);
    res.send(renderJoinPage(link, remainingSpots, proxyId));
    
  } catch (error) {
    console.error('❌ Error in proxy GET route:', error);
    logActivity('Proxy GET error', { proxyId: req.params.proxyId, error: error.message });
    return res.status(500).send(renderLinkNotFound());
  }
});

// Check if fingerprint already exists
router.post('/:proxyId/check', async (req, res) => {
  try {
    const { proxyId } = req.params;
    const { fingerprint } = req.body;
    const db = getDatabase();

    console.log('🔍 Checking fingerprint:', fingerprint, 'for proxy:', proxyId);

    if (!fingerprint) {
      return res.json({ alreadyParticipated: false });
    }

    // Check if this fingerprint has already been used for this proxy
    const usage = await db.get('SELECT * FROM link_usage WHERE proxy_id = ? AND user_fingerprint = ?', [proxyId, fingerprint]);

    if (usage) {
      console.log('❌ Fingerprint already used:', fingerprint, 'Participant:', usage.participant_number);
      
      // Get link info for the response
      const link = await db.get('SELECT * FROM proxy_links WHERE proxy_id = ?', [proxyId]);
      
      return res.json({ 
        alreadyParticipated: true,
        usage: usage,
        link: link
      });
    } else {
      console.log('✅ Fingerprint not found, allowing participation:', fingerprint);
      return res.json({ alreadyParticipated: false });
    }
    
  } catch (error) {
    console.error('❌ Error checking fingerprint:', error);
    return res.json({ alreadyParticipated: false });
  }
});

// Mark link as used
router.post('/:proxyId/use', async (req, res) => {
  try {
    const { proxyId } = req.params;
    const { fingerprint } = req.body;
    const sessionId = req.session.id || 'no-session';
    const userIp = getClientIP(req);
    const db = getDatabase();

    if (!fingerprint) {
      return res.json({ success: false, error: 'Fingerprint required' });
    }

    logActivity('Link usage attempt', { proxyId, sessionId, userIp, fingerprint });
    console.log('🔍 POST /use - Fingerprint:', fingerprint, 'for proxyId:', proxyId);

    // Get current link info
    const link = await db.get('SELECT current_uses, max_uses, group_name, real_url FROM proxy_links WHERE proxy_id = ?', [proxyId]);
    
    if (!link) {
      logActivity('Link not found for usage', { proxyId });
      return res.json({ success: false, error: 'Link not found' });
    }
    
    console.log('🔍 Link info:', link.group_name, 'Current uses:', link.current_uses, 'Max:', link.max_uses);
    
    if (link.current_uses >= link.max_uses) {
      logActivity('Usage exceeded', { proxyId, currentUses: link.current_uses });
      return res.json({ success: false, error: 'Link usage exceeded' });
    }
    
    // Check if fingerprint already used this link
    const existingUsage = await db.get('SELECT * FROM link_usage WHERE proxy_id = ? AND user_fingerprint = ?', [proxyId, fingerprint]);
    
    if (existingUsage) {
      console.log('❌ Fingerprint already used this link, blocking duplicate usage');
      return res.json({ 
        success: false, 
        error: 'Link already used by this user' 
      });
    }
    
    const participantNumber = link.current_uses + 1;
    console.log('🔍 Assigning participant number:', participantNumber);
    
    // Insert usage record
    await db.run('INSERT INTO link_usage (proxy_id, session_id, user_ip, user_fingerprint, participant_number, used_at) VALUES (?, ?, ?, ?, ?, ?)', 
      [proxyId, sessionId, userIp, fingerprint, participantNumber, new Date()]);
    
    console.log('✅ Successfully inserted usage record for fingerprint:', fingerprint);
    
    // Update current_uses count
    await db.run('UPDATE proxy_links SET current_uses = current_uses + 1 WHERE proxy_id = ?', [proxyId]);
    
    logActivity('Link used successfully', { 
      proxyId,
      groupName: link.group_name,
      participantNumber,
      sessionId,
      userIp,
      fingerprint,
      remainingSpots: link.max_uses - participantNumber
    });
    
    console.log('✅ Link usage completed successfully for fingerprint:', fingerprint, 'participant:', participantNumber);
    
    res.json({ 
      success: true, 
      participantNumber: participantNumber,
      remainingSpots: link.max_uses - participantNumber,
      groupName: link.group_name
    });
    
  } catch (error) {
    console.error('❌ Error in POST /use:', error);
    logActivity('Usage error', { proxyId: req.params.proxyId, error: error.message });
    return res.json({ success: false, error: 'Database error: ' + error.message });
  }
});

// Get link info (for debugging - admin only)
router.get('/:proxyId/info', (req, res) => {
  if (!req.session.adminLoggedIn) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { proxyId } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM proxy_links WHERE proxy_id = ?', [proxyId], (err, link) => {
    if (err || !link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    db.all('SELECT * FROM link_usage WHERE proxy_id = ? ORDER BY used_at', 
      [proxyId], (err, usage) => {
        res.json({
          link: link,
          usage: usage || []
        });
      });
  });
});

module.exports = router;