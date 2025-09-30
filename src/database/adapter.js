// Database adapter for multiple database types
const path = require('path');

let db = null;

function initDatabase() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl && databaseUrl.startsWith('mysql://')) {
        // MySQL for production
        return initMySQL(databaseUrl);
    } else {
        // SQLite for development
        return initSQLite();
    }
}

function initSQLite() {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(process.cwd(), 'proxy.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err.message);
            return;
        }
        console.log('📁 Connected to SQLite database');
        createTables();
    });
    
    return db;
}

// PostgreSQL support removed

function initMySQL(databaseUrl) {
    console.log('🐬 MySQL support requires additional setup');
    console.log('Please use the SQL schema provided in DEPLOYMENT.md');
    
    // For now, return a mock interface
    return createMockInterface();
}

function createMockInterface() {
    return {
        run: (sql, params, callback) => {
            console.log('Mock DB operation:', sql);
            if (callback) callback(null);
        },
        get: (sql, params, callback) => {
            console.log('Mock DB query:', sql);
            if (callback) callback(null, null);
        },
        all: (sql, params, callback) => {
            console.log('Mock DB query:', sql);
            if (callback) callback(null, []);
        },
        serialize: (callback) => {
            if (callback) callback();
        }
    };
}

function createTables() {
    if (!db || typeof db.serialize !== 'function') return;
    
    db.serialize(() => {
        // Create admins table
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create proxy_links table
        db.run(`CREATE TABLE IF NOT EXISTS proxy_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            proxy_id TEXT UNIQUE NOT NULL,
            real_url TEXT NOT NULL,
            group_name TEXT,
            max_uses INTEGER DEFAULT 3,
            current_uses INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create link_usage table
        db.run(`CREATE TABLE IF NOT EXISTS link_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            proxy_id TEXT NOT NULL,
            fingerprint TEXT NOT NULL,
            used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            participant_number INTEGER,
            ip_address TEXT,
            user_agent TEXT,
            FOREIGN KEY (proxy_id) REFERENCES proxy_links(proxy_id) ON DELETE CASCADE
        )`);

        // Create activity_logs table
        db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert default admin if not exists
        db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
            if (!err && row.count === 0) {
                const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
                const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
                
                db.run('INSERT INTO admins (username, password) VALUES (?, ?)', 
                    [defaultUsername, defaultPassword], (err) => {
                        if (!err) {
                            console.log(`👤 Default admin created: ${defaultUsername}`);
                        }
                    });
            }
        });

        console.log('✅ Database tables initialized');
    });
}

function getDatabase() {
    return db;
}

module.exports = {
    initDatabase,
    getDatabase
};