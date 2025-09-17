// PostgreSQL adapter for Vercel deployment
const { Pool } = require('pg');

let pool = null;

function initDatabase() {
    console.log('🔍 PostgreSQL initDatabase() called');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is required for production');
        throw new Error('DATABASE_URL environment variable is required');
    }

    console.log('🔗 DATABASE_URL found, creating connection pool...');
    console.log('🔗 Connection string (first 50 chars):', process.env.DATABASE_URL.substring(0, 50) + '...');

    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        console.log('🐘 PostgreSQL connection pool created');
        
        // Test the connection
        pool.query('SELECT NOW()', (err, result) => {
            if (err) {
                console.error('❌ PostgreSQL connection test failed:', err);
            } else {
                console.log('✅ PostgreSQL connection test successful:', result.rows[0]);
            }
        });

        return createDatabaseInterface();
    } catch (error) {
        console.error('❌ Error creating PostgreSQL connection pool:', error);
        throw error;
    }
}

function createDatabaseInterface() {
    return {
        run: async (sql, params = [], callback) => {
            console.log('🔍 PostgreSQL run() called with SQL:', sql.substring(0, 100) + '...');
            try {
                const result = await pool.query(sql, params);
                console.log('✅ PostgreSQL query successful, affected rows:', result.rowCount);
                if (callback) callback(null, result);
                return result;
            } catch (error) {
                console.error('❌ PostgreSQL run() error:', error.message);
                console.error('❌ SQL:', sql);
                console.error('❌ Params:', params);
                if (callback) callback(error);
                throw error;
            }
        },

        get: async (sql, params = [], callback) => {
            console.log('🔍 PostgreSQL get() called with SQL:', sql.substring(0, 100) + '...');
            try {
                const result = await pool.query(sql, params);
                const row = result.rows[0] || null;
                console.log('✅ PostgreSQL get() successful, found row:', !!row);
                if (callback) callback(null, row);
                return row;
            } catch (error) {
                console.error('❌ PostgreSQL get() error:', error.message);
                console.error('❌ SQL:', sql);
                console.error('❌ Params:', params);
                if (callback) callback(error);
                throw error;
            }
        },

        all: async (sql, params = [], callback) => {
            try {
                const result = await pool.query(sql, params);
                if (callback) callback(null, result.rows);
                return result.rows;
            } catch (error) {
                console.error('Database error:', error);
                if (callback) callback(error);
                throw error;
            }
        },

        serialize: (callback) => {
            if (callback) callback();
        }
    };
}

function getDatabase() {
    console.log('🔍 PostgreSQL getDatabase() called');
    if (!pool) {
        console.error('❌ PostgreSQL pool not initialized');
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    console.log('✅ PostgreSQL pool exists, returning interface');
    return createDatabaseInterface();
}

module.exports = {
    initDatabase,
    getDatabase
};