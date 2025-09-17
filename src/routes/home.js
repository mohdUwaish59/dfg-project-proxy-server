const express = require('express');
const { renderHomePage } = require('../views/homeView');

const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.send(renderHomePage());
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../../package.json').version
  });
});

// API info endpoint
router.get('/api', (req, res) => {
  res.json({
    name: 'oTree Proxy Server',
    version: require('../../package.json').version,
    description: 'Professional link management for research experiments',
    endpoints: {
      admin: '/admin',
      proxy: '/proxy/:proxyId',
      health: '/health'
    },
    features: [
      'One-time use links',
      'Group management',
      'Session tracking',
      'Admin dashboard',
      'Usage analytics'
    ]
  });
});

module.exports = router;