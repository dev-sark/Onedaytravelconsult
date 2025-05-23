const crypto = require('crypto');

// Generate two different 64-byte random strings
const jwtSecret = crypto.randomBytes(64).toString('hex');
const sessionSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated Secrets:');
console.log('JWT_SECRET=', jwtSecret);
console.log('SESSION_SECRET=', sessionSecret);
