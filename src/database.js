const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function initDatabase() {
  console.log('🔍 DATABASE DEBUG INFO:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL starts with postgresql:', process.env.DATABASE_URL?.startsWith('postgresql://'));
  
  // Use PostgreSQL for production (Vercel), SQLite for development
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log('🐘 Using PostgreSQL for production');
    console.log('DATABASE_URL (first 50 chars):', process.env.DATABASE_URL.substring(0, 50) + '...');
    
    try {
      const { initDatabase: initPG } = require('./database/postgresql');
      return initPG();
    } catch (error) {
      console.error('❌ Error loading PostgreSQL module:', error);
      throw error;
    }
  }
  
  // SQLite for development
  const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/proxy.db'  // Vercel's temporary directory (won't persist!)
    : path.join(process.cwd(), 'proxy.db');
    
  console.log('📁 Using SQLite database at:', dbPath);
  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    // Add new columns to existing table if it exists (for migration)
    db.run(`ALTER TABLE proxy_links ADD COLUMN group_name TEXT`, () => { });
    db.run(`ALTER TABLE proxy_links ADD COLUMN max_uses INTEGER DEFAULT 3`, () => { });
    db.run(`ALTER TABLE proxy_links ADD COLUMN current_uses INTEGER DEFAULT 0`, () => { });
    db.run(`ALTER TABLE link_usage ADD COLUMN participant_number INTEGER`, () => { });
    db.run(`ALTER TABLE link_usage ADD COLUMN user_fingerprint TEXT`, () => { });

    // Create proxy links table
    db.run(`CREATE TABLE IF NOT EXISTS proxy_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proxy_id TEXT UNIQUE NOT NULL,
      real_url TEXT NOT NULL,
      group_name TEXT,
      max_uses INTEGER DEFAULT 3,
      current_uses INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      created_by TEXT DEFAULT 'admin'
    )`);

    // Create link usage tracking table
    db.run(`CREATE TABLE IF NOT EXISTS link_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proxy_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      user_ip TEXT,
      user_fingerprint TEXT,
      participant_number INTEGER,
      used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(proxy_id, user_fingerprint)
    )`);

    // Create admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin
    db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`,
      ['admin', 'admin123']);

    console.log('📊 Database initialized successfully');
  });

  return db;
}

function getDatabase() {
  console.log('🔍 getDatabase() called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  // Use PostgreSQL for production
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log('🐘 Getting PostgreSQL database');
    try {
      const { getDatabase: getPG } = require('./database/postgresql');
      return getPG();
    } catch (error) {
      console.error('❌ Error getting PostgreSQL database:', error);
      throw error;
    }
  }
  
  // SQLite for development
  console.log('📁 Using SQLite database');
  if (!db) {
    console.error('❌ SQLite database not initialized');
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};