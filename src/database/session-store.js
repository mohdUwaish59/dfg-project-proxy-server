// MongoDB session store for Vercel serverless functions
const { MongoClient } = require('mongodb');

class MongoSessionStore {
    constructor(options = {}) {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.connectionString = options.connectionString || process.env.DATABASE_URL;
        this.dbName = options.dbName || 'otree_proxy';
        this.collectionName = options.collectionName || 'sessions';
        this.ttl = options.ttl || 86400; // 24 hours in seconds
    }

    async connect() {
        if (!this.client) {
            this.client = new MongoClient(this.connectionString);
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
            
            // Create TTL index for automatic session cleanup
            await this.collection.createIndex(
                { "expires": 1 }, 
                { expireAfterSeconds: 0 }
            );
            
            console.log('✅ MongoDB session store connected');
        }
    }

    async get(sid, callback) {
        try {
            await this.connect();
            console.log('🔍 Session get:', sid);
            
            const session = await this.collection.findOne({ _id: sid });
            
            if (!session) {
                console.log('❌ Session not found:', sid);
                return callback(null, null);
            }
            
            if (session.expires && session.expires < new Date()) {
                console.log('❌ Session expired:', sid);
                await this.collection.deleteOne({ _id: sid });
                return callback(null, null);
            }
            
            console.log('✅ Session found:', sid, session.data);
            callback(null, session.data);
        } catch (error) {
            console.error('❌ Session get error:', error);
            callback(error);
        }
    }

    async set(sid, session, callback) {
        try {
            await this.connect();
            console.log('🔍 Session set:', sid, session);
            
            const expires = new Date(Date.now() + (this.ttl * 1000));
            
            await this.collection.replaceOne(
                { _id: sid },
                {
                    _id: sid,
                    data: session,
                    expires: expires
                },
                { upsert: true }
            );
            
            console.log('✅ Session saved:', sid);
            if (callback) callback(null);
        } catch (error) {
            console.error('❌ Session set error:', error);
            if (callback) callback(error);
        }
    }

    async destroy(sid, callback) {
        try {
            await this.connect();
            console.log('🔍 Session destroy:', sid);
            
            await this.collection.deleteOne({ _id: sid });
            
            console.log('✅ Session destroyed:', sid);
            if (callback) callback(null);
        } catch (error) {
            console.error('❌ Session destroy error:', error);
            if (callback) callback(error);
        }
    }

    async touch(sid, session, callback) {
        try {
            await this.connect();
            
            const expires = new Date(Date.now() + (this.ttl * 1000));
            
            await this.collection.updateOne(
                { _id: sid },
                { $set: { expires: expires } }
            );
            
            if (callback) callback(null);
        } catch (error) {
            console.error('❌ Session touch error:', error);
            if (callback) callback(error);
        }
    }
}

module.exports = MongoSessionStore;