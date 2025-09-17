// MongoDB adapter for Vercel deployment using MongoDB Atlas
const { MongoClient, ServerApiVersion } = require('mongodb');

let client = null;
let db = null;

function initDatabase() {
    console.log('🔍 MongoDB initDatabase() called');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is required for MongoDB');
        throw new Error('DATABASE_URL environment variable is required');
    }

    console.log('🔗 DATABASE_URL found, creating MongoDB connection...');
    console.log('🔗 Connection string (first 50 chars):', process.env.DATABASE_URL.substring(0, 50) + '...');

    try {
        // Create MongoDB client with your configuration
        client = new MongoClient(process.env.DATABASE_URL, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        console.log('🍃 MongoDB client created');
        
        // Connect and test
        connectAndTest();
        
        return createDatabaseInterface();
    } catch (error) {
        console.error('❌ Error creating MongoDB client:', error);
        throw error;
    }
}

async function connectAndTest() {
    try {
        await client.connect();
        db = client.db('otree_proxy'); // Use a specific database name
        
        // Test the connection
        await client.db("admin").command({ ping: 1 });
        console.log('✅ MongoDB connection test successful - Pinged deployment!');
        
        // Create indexes for better performance
        await createIndexes();
        
    } catch (error) {
        console.error('❌ MongoDB connection test failed:', error);
        throw error;
    }
}

async function createIndexes() {
    try {
        // Create indexes for better performance
        await db.collection('admins').createIndex({ username: 1 }, { unique: true });
        await db.collection('proxy_links').createIndex({ proxy_id: 1 }, { unique: true });
        await db.collection('link_usage').createIndex({ proxy_id: 1, user_fingerprint: 1 }, { unique: true });
        
        console.log('✅ MongoDB indexes created');
    } catch (error) {
        console.log('ℹ️ MongoDB indexes may already exist:', error.message);
    }
}

function createDatabaseInterface() {
    return {
        run: async (query, params = [], callback) => {
            console.log('🔍 MongoDB run() called with query type:', getQueryType(query));
            try {
                const result = await executeMongoQuery(query, params);
                console.log('✅ MongoDB operation successful');
                if (callback) callback(null, { changes: result.modifiedCount || result.insertedCount || 1 });
                return result;
            } catch (error) {
                console.error('❌ MongoDB run() error:', error.message);
                if (callback) callback(error);
                throw error;
            }
        },

        get: async (query, params = [], callback) => {
            console.log('🔍 MongoDB get() called with query type:', getQueryType(query));
            try {
                const result = await executeMongoQuery(query, params);
                const row = Array.isArray(result) ? result[0] || null : result;
                console.log('✅ MongoDB get() successful, found document:', !!row);
                if (callback) callback(null, row);
                return row;
            } catch (error) {
                console.error('❌ MongoDB get() error:', error.message);
                if (callback) callback(error);
                throw error;
            }
        },

        all: async (query, params = [], callback) => {
            console.log('🔍 MongoDB all() called with query type:', getQueryType(query));
            try {
                const result = await executeMongoQuery(query, params);
                const rows = Array.isArray(result) ? result : [result].filter(Boolean);
                console.log('✅ MongoDB all() successful, found documents:', rows.length);
                if (callback) callback(null, rows);
                return rows;
            } catch (error) {
                console.error('❌ MongoDB all() error:', error.message);
                if (callback) callback(error);
                throw error;
            }
        },

        serialize: (callback) => {
            if (callback) callback();
        }
    };
}

function getQueryType(query) {
    const q = query.toLowerCase().trim();
    if (q.startsWith('select')) return 'SELECT';
    if (q.startsWith('insert')) return 'INSERT';
    if (q.startsWith('update')) return 'UPDATE';
    if (q.startsWith('delete')) return 'DELETE';
    return 'UNKNOWN';
}

async function executeMongoQuery(query, params = []) {
    if (!db) {
        await connectAndTest();
    }

    const queryType = getQueryType(query);
    console.log('🔍 Executing MongoDB operation:', queryType);
    console.log('🔍 Original SQL:', query.substring(0, 100) + '...');
    console.log('🔍 Parameters:', params);

    try {
        switch (queryType) {
            case 'SELECT':
                return await handleSelect(query, params);
            case 'INSERT':
                return await handleInsert(query, params);
            case 'UPDATE':
                return await handleUpdate(query, params);
            case 'DELETE':
                return await handleDelete(query, params);
            default:
                throw new Error(`Unsupported query type: ${queryType}`);
        }
    } catch (error) {
        console.error('❌ MongoDB query execution error:', error);
        throw error;
    }
}

async function handleSelect(query, params) {
    // Parse different SELECT queries and convert to MongoDB operations
    
    // Admin login query
    if (query.includes('FROM admins WHERE username = ? AND password = ?')) {
        const [username, password] = params;
        return await db.collection('admins').findOne({ username, password });
    }
    
    // Get all proxy links
    if (query.includes('FROM proxy_links ORDER BY created_at DESC')) {
        return await db.collection('proxy_links').find({}).sort({ created_at: -1 }).toArray();
    }
    
    // Get stats query
    if (query.includes('COUNT(*) as total')) {
        const total = await db.collection('proxy_links').countDocuments();
        const active = await db.collection('proxy_links').countDocuments({ is_active: true });
        const links = await db.collection('proxy_links').find({}).toArray();
        const participants = links.reduce((sum, link) => sum + (link.current_uses || 0), 0);
        const full = links.filter(link => (link.current_uses || 0) >= (link.max_uses || 3)).length;
        
        return { total, active, participants, full };
    }
    
    // Default: try to parse table name
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (tableMatch) {
        const tableName = tableMatch[1];
        return await db.collection(tableName).find({}).toArray();
    }
    
    throw new Error('Unsupported SELECT query');
}

async function handleInsert(query, params) {
    // Admin creation (during initialization)
    if (query.includes('INTO admins')) {
        const [username, password] = params;
        const doc = { 
            username, 
            password, 
            created_at: new Date() 
        };
        
        // Use upsert to avoid duplicates
        return await db.collection('admins').replaceOne(
            { username }, 
            doc, 
            { upsert: true }
        );
    }
    
    // Create proxy link
    if (query.includes('INTO proxy_links')) {
        const [proxy_id, real_url, group_name, max_uses] = params;
        const doc = {
            proxy_id,
            real_url,
            group_name,
            max_uses: max_uses || 3,
            current_uses: 0,
            is_active: true,
            created_at: new Date(),
            created_by: 'admin'
        };
        
        return await db.collection('proxy_links').insertOne(doc);
    }
    
    // Link usage tracking
    if (query.includes('INTO link_usage')) {
        const doc = {
            proxy_id: params[0],
            session_id: params[1],
            user_ip: params[2],
            user_fingerprint: params[3],
            participant_number: params[4],
            used_at: new Date()
        };
        
        return await db.collection('link_usage').insertOne(doc);
    }
    
    throw new Error('Unsupported INSERT query');
}

async function handleUpdate(query, params) {
    // Toggle link activation
    if (query.includes('SET is_active = ? WHERE proxy_id = ?')) {
        const [is_active, proxy_id] = params;
        return await db.collection('proxy_links').updateOne(
            { proxy_id },
            { $set: { is_active: !!is_active } }
        );
    }
    
    // Reset usage count
    if (query.includes('SET current_uses = 0 WHERE proxy_id = ?')) {
        const [proxy_id] = params;
        return await db.collection('proxy_links').updateOne(
            { proxy_id },
            { $set: { current_uses: 0 } }
        );
    }
    
    // Increment usage count
    if (query.includes('SET current_uses = current_uses + 1')) {
        const proxy_id = params[0];
        return await db.collection('proxy_links').updateOne(
            { proxy_id },
            { $inc: { current_uses: 1 } }
        );
    }
    
    throw new Error('Unsupported UPDATE query');
}

async function handleDelete(query, params) {
    // Delete link usage records
    if (query.includes('FROM link_usage WHERE proxy_id = ?')) {
        const [proxy_id] = params;
        return await db.collection('link_usage').deleteMany({ proxy_id });
    }
    
    // Delete proxy link
    if (query.includes('FROM proxy_links WHERE proxy_id = ?')) {
        const [proxy_id] = params;
        return await db.collection('proxy_links').deleteOne({ proxy_id });
    }
    
    throw new Error('Unsupported DELETE query');
}

function getDatabase() {
    console.log('🔍 MongoDB getDatabase() called');
    if (!client) {
        console.error('❌ MongoDB client not initialized');
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    console.log('✅ MongoDB client exists, returning interface');
    return createDatabaseInterface();
}

// Initialize default admin user
async function initializeDefaultAdmin() {
    try {
        if (!db) await connectAndTest();
        
        const existingAdmin = await db.collection('admins').findOne({ username: 'admin' });
        if (!existingAdmin) {
            await db.collection('admins').insertOne({
                username: 'admin',
                password: 'admin123',
                created_at: new Date()
            });
            console.log('✅ Default admin user created');
        } else {
            console.log('ℹ️ Default admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error initializing default admin:', error);
    }
}

// Call this after initialization
setTimeout(initializeDefaultAdmin, 1000);

module.exports = {
    initDatabase,
    getDatabase
};