// PostgreSQL adapter for Vercel deployment
const { Pool } = require('pg');

let pool = null;

function initDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is required for production');
        return null;
    }

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('🐘 Connected to PostgreSQL database');
    return createDatabaseInterface();
}

function createDatabaseInterface() {
    return {
        run: async (sql, params = [], callback) => {
            try {
                const result = await pool.query(sql, params);
                if (callback) callback(null, result);
                return result;
            } catch (error) {
                console.error('Database error:', error);
                if (callback) callback(error);
                throw error;
            }
        },

        get: async (sql, params = [], callback) => {
            try {
                const result = await pool.query(sql, params);
                const row = result.rows[0] || null;
                if (callback) callback(null, row);
                return row;
            } catch (error) {
                console.error('Database error:', error);
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
    if (!pool) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return createDatabaseInterface();
}

module.exports = {
    initDatabase,
    getDatabase
};