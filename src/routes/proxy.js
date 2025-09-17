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
router.get('/:proxyId', (req, res) => {
  const { proxyId } = req.params;
  
  // Ensure session is initialized
  if (!req.session.initialized) {
    req.session.initialized = true;
  }
  
  const sessionId = req.session.id;
  const userIp = getClientIP(req);
  const db = getDatabase();

  logActivity('Proxy access attempt', { proxyId, sessionId, userIp });
  console.log('DEBUG: Session ID:', sessionId, 'for proxyId:', proxyId);

  // Check if link exists and is active
  db.get('SELECT * FROM proxy_links WHERE proxy_id = ? AND is_active = 1', 
    [proxyId], (err, link) => {
      if (err || !link) {
        logActivity('Link not found or inactive', { proxyId, error: err?.message });
        return res.status(404).send(renderLinkNotFound());
      }

      // Check if link has reached maximum usage
      if (link.current_uses >= link.max_uses) {
        logActivity('Experiment full', { proxyId, groupName: link.group_name });
        return res.send(renderExperimentFull(link));
      }

      // For GET requests, we can't check fingerprint yet, so just show the join page
      // The fingerprint check will happen on the client side and via POST request

      // Show the join page
      const remainingSpots = link.max_uses - link.current_uses;
      logActivity('Showing join page', { 
        proxyId, 
        groupName: link.group_name, 
        remainingSpots 
      });
      
      res.send(renderJoinPage(link, remainingSpots, proxyId));
    });
});

// Check if fingerprint already exists
router.post('/:proxyId/check', (req, res) => {
  const { proxyId } = req.params;
  const { fingerprint } = req.body;
  const db = getDatabase();

  if (!fingerprint) {
    return res.json({ alreadyParticipated: false });
  }

  db.get('SELECT * FROM link_usage WHERE proxy_id = ? AND user_fingerprint = ?', 
    [proxyId, fingerprint], (err, usage) => {
      if (err) {
        console.error('Error checking fingerprint:', err);
        return res.json({ alreadyParticipated: false });
      }

      if (usage) {
        // Get link info for the response
        db.get('SELECT * FROM proxy_links WHERE proxy_id = ?', [proxyId], (err, link) => {
          res.json({ 
            alreadyParticipated: true,
            usage: usage,
            link: link
          });
        });
      } else {
        res.json({ alreadyParticipated: false });
      }
    });
});

// Mark link as used
router.post('/:proxyId/use', (req, res) => {
  const { proxyId } = req.params;
  const { fingerprint } = req.body;
  const sessionId = req.session.id;
  const userIp = getClientIP(req);
  const db = getDatabase();

  if (!fingerprint) {
    return res.json({ success: false, error: 'Fingerprint required' });
  }

  logActivity('Link usage attempt', { proxyId, sessionId, userIp, fingerprint });
  console.log('DEBUG: POST /use - Fingerprint:', fingerprint, 'for proxyId:', proxyId);

  db.serialize(() => {
    // Get current usage count
    db.get('SELECT current_uses, max_uses, group_name FROM proxy_links WHERE proxy_id = ?', 
      [proxyId], (err, link) => {
        if (err || !link) {
          logActivity('Link not found for usage', { proxyId, error: err?.message });
          return res.json({ success: false, error: 'Link not found' });
        }
        
        if (link.current_uses >= link.max_uses) {
          logActivity('Usage exceeded', { proxyId, currentUses: link.current_uses });
          return res.json({ success: false, error: 'Link usage exceeded' });
        }
        
        const participantNumber = link.current_uses + 1;
        
        // Check if fingerprint already used this link
        db.get('SELECT * FROM link_usage WHERE proxy_id = ? AND user_fingerprint = ?', 
          [proxyId, fingerprint], (err, existingUsage) => {
            if (existingUsage) {
              console.log('DEBUG: Fingerprint already used this link, blocking duplicate usage');
              return res.json({ 
                success: false, 
                error: 'Link already used by this user' 
              });
            }
            
            // Insert usage record
            db.run('INSERT INTO link_usage (proxy_id, session_id, user_ip, user_fingerprint, participant_number) VALUES (?, ?, ?, ?, ?)', 
              [proxyId, sessionId, userIp, fingerprint, participantNumber], function(err) {
              if (err) {
                logActivity('Usage insert error', { proxyId, error: err.message });
                return res.json({ success: false, error: 'Database error' });
              }
              
              console.log('DEBUG: Successfully inserted usage record for fingerprint:', fingerprint);
              // Update current_uses count
              db.run('UPDATE proxy_links SET current_uses = current_uses + 1 WHERE proxy_id = ?', 
                [proxyId], function(err) {
                  if (err) {
                    logActivity('Usage count update error', { proxyId, error: err.message });
                    return res.json({ success: false, error: 'Database error' });
                  }
                  
                  logActivity('Link used successfully', { 
                    proxyId,
                    groupName: link.group_name,
                    participantNumber,
                    sessionId,
                    userIp,
                    remainingSpots: link.max_uses - participantNumber
                  });
                  
                  console.log('DEBUG: Link usage completed successfully for fingerprint:', fingerprint, 'participant:', participantNumber);
                  
                  res.json({ 
                    success: true, 
                    participantNumber: participantNumber,
                    remainingSpots: link.max_uses - participantNumber,
                    groupName: link.group_name
                  });
                });
            });
          });
      });
  });
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