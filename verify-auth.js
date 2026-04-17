const jwt = require('jsonwebtoken');
const verifyToken = require('./src/middleware/verifyToken');

// Mock Secret (Must match your shared dev fallback)
const TEST_SECRET = 'fitforge_dev_secret';
process.env.JWT_SECRET = TEST_SECRET;

console.log('--- Auth Test ---');
const payload = { userId: '12345' };
const token = jwt.sign(payload, TEST_SECRET);

const mockRes = { status: (c) => ({ json: (d) => console.log(`Result: ${c} - ${JSON.stringify(d)}`) }) };
const next = () => console.log('✅ Success: Middleware passed.');

console.log('Test 1: Valid Token');
verifyToken({ headers: { authorization: `Bearer ${token}` } }, mockRes, next);

console.log('\nTest 2: No Token');
verifyToken({ headers: {} }, mockRes, next);
