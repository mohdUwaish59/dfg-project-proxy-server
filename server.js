const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

// Import our modules
const { initDatabase } = require('./src/database');
const adminRoutes = require('./src/routes/admin');
const proxyRoutes = require('./src/routes/proxy');
const homeRoutes = require('./src/routes/home');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false, // Don't save empty sessions
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Choose session store based on database type
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mongodb')) {
  // Use MongoDB session store for production with MongoDB
  console.log('🍃 Using MongoDB session store');
  const MongoStore = require('connect-mongo');
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    dbName: 'otree_proxy',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 24 hours in seconds
  });
} else if (process.env.NODE_ENV !== 'production') {
  // Use SQLite store for development
  console.log('📁 Using SQLite session store');
  sessionConfig.store = new SQLiteStore({ 
    db: 'sessions.db',
    dir: process.cwd()
  });
} else {
  // Use memory store as fallback (not recommended for production)
  console.log('⚠️ Using memory session store (sessions won\'t persist)');
}

app.use(session(sessionConfig));

// Initialize database
console.log('🔍 SERVER STARTUP DEBUG:');
console.log('🔍 Environment variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('  - SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
console.log('  - PORT:', process.env.PORT);

console.log('🔍 Initializing database...');
try {
  initDatabase();
  console.log('✅ Database initialization completed');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  console.error('❌ Error stack:', error.stack);
}

// Routes
app.use('/', homeRoutes);
app.use('/admin', adminRoutes);
app.use('/proxy', proxyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Page Not Found</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { 
                font-family: 'Inter', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
            }
            .container {
                background: white;
                padding: 50px;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>404 - Page Not Found</h1>
            <p>The requested page does not exist.</p>
            <a href="/" style="color: #667eea;">← Go Home</a>
        </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔑 Default admin credentials: admin / admin123`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;