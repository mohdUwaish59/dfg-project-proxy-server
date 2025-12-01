#!/usr/bin/env node

// Script to create a secure admin user manually
require('dotenv').config();
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

async function createAdmin() {
    console.log('🔐 Secure Admin Creation Tool\n');
    
    // Check for required environment variables
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is required');
        console.log('Set it in your .env file or run:');
        console.log('DATABASE_URL=your-mongodb-connection-string node create-admin.js');
        process.exit(1);
    }
    
    // Get admin credentials from command line arguments or prompt
    const args = process.argv.slice(2);
    let username, password;
    
    if (args.length >= 2) {
        username = args[0];
        password = args[1];
    } else {
        console.log('Usage: node create-admin.js <username> <password>');
        console.log('Example: node create-admin.js myuser mySecurePassword123!');
        process.exit(1);
    }
    
    // Validate password strength
    if (password.length < 8) {
        console.error('❌ Password must be at least 8 characters long');
        process.exit(1);
    }
    
    if (password === 'admin123' || password === 'password' || password === '123456') {
        console.error('❌ Password is too weak. Use a strong, unique password.');
        process.exit(1);
    }
    
    try {
        console.log('🔗 Connecting to MongoDB...');
        const client = new MongoClient(process.env.DATABASE_URL);
        await client.connect();
        
        const db = client.db('otree_proxy');
        const adminsCollection = db.collection('admins');
        
        // Check if admin already exists
        const existingAdmin = await adminsCollection.findOne({ username });
        if (existingAdmin) {
            console.error(`❌ Admin user '${username}' already exists`);
            console.log('To update password, delete the existing admin first or use a different username');
            await client.close();
            process.exit(1);
        }
        
        // Create the admin user
        const adminDoc = {
            username,
            password, // In production, you might want to hash this
            created_at: new Date(),
            created_by: 'manual-script'
        };
        
        await adminsCollection.insertOne(adminDoc);
        
        console.log('✅ Admin user created successfully!');
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${password}`);
        console.log('\n⚠️  Important:');
        console.log('1. Store these credentials securely');
        console.log('2. Delete this script output from your terminal history');
        console.log('3. Consider using environment variables for the password');
        
        await client.close();
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
}

// Generate a secure password suggestion
function generateSecurePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

if (require.main === module) {
    createAdmin().catch(console.error);
}

module.exports = { createAdmin };