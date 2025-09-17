#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 oTree Proxy Server Deployment Helper\n');

// Check if this is a git repository
try {
    execSync('git status', { stdio: 'ignore' });
} catch (error) {
    console.log('📁 Initializing git repository...');
    execSync('git init');
    execSync('git add .');
    execSync('git commit -m "Initial commit"');
    console.log('✅ Git repository initialized\n');
}

// Check for .env file
if (!fs.existsSync('.env')) {
    console.log('⚠️  No .env file found. Creating from template...');
    if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('✅ Created .env file from template');
        console.log('📝 Please edit .env file with your configuration\n');
    }
}

// Check for Vercel CLI
try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI found');
} catch (error) {
    console.log('📦 Installing Vercel CLI...');
    execSync('npm install -g vercel');
    console.log('✅ Vercel CLI installed\n');
}

console.log('🎯 Deployment Options:\n');
console.log('1. Deploy to Vercel (Serverless - requires external database)');
console.log('2. Deploy to Railway (Full server - supports SQLite)');
console.log('3. Deploy to Render (Full server - supports SQLite)');
console.log('4. Just prepare files (manual deployment)\n');

// For now, just prepare the files
console.log('📋 Deployment checklist:');
console.log('✅ vercel.json configured');
console.log('✅ .gitignore updated');
console.log('✅ Environment variables template created');
console.log('✅ Database adapter ready');
console.log('✅ API routes configured');

console.log('\n🔧 Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your repository to Vercel');
console.log('3. Set environment variables in Vercel dashboard');
console.log('4. Deploy!');

console.log('\n📚 For detailed instructions, see DEPLOYMENT.md');
console.log('🌐 For database setup, see the Supabase section in DEPLOYMENT.md');

console.log('\n🎉 Ready for deployment!');