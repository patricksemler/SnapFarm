// Verification script to test the file-based authentication
// Run with: node verify-auth.js

const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json');

console.log('🔍 Verifying authentication file system...');

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    console.log('📁 Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
}

// Check users file
if (fs.existsSync(USERS_FILE)) {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    console.log('👥 Users file found:', users.length, 'users');
    users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.displayName})`);
    });
} else {
    console.log('📝 Creating empty users file...');
    fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

// Check sessions file
if (fs.existsSync(SESSIONS_FILE)) {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    console.log('🎫 Sessions file found:', sessions.length, 'active sessions');
} else {
    console.log('📝 Creating empty sessions file...');
    fs.writeFileSync(SESSIONS_FILE, '[]', 'utf8');
}

console.log('✅ Authentication file system ready!');