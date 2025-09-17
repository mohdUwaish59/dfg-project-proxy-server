#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 SESSION_SECRET Generator\n');

// Generate a secure random secret
const secret = crypto.randomBytes(32).toString('hex');

console.log('Your SESSION_SECRET:');
console.log('━'.repeat(80));
console.log(secret);
console.log('━'.repeat(80));

console.log('\n📋 Copy this secret and use it in your environment variables:');
console.log(`SESSION_SECRET=${secret}`);

console.log('\n✅ This secret is:');
console.log('• 64 characters long (32 bytes in hex)');
console.log('• Cryptographically secure');
console.log('• Unique to your application');

console.log('\n⚠️  Important:');
console.log('• Keep this secret private');
console.log('• Never commit it to version control');
console.log('• Use different secrets for dev/prod');
console.log('• Store it in environment variables only');

console.log('\n🚀 Ready to deploy securely!');