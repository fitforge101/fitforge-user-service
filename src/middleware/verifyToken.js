const jwt = require('jsonwebtoken');

// Shared secret pattern used across all microservices
const JWT_SECRET = process.env.JWT_SECRET || 'fitforge_dev_secret';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token and attach payload to request object
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.error('[auth] Token verification failed:', err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
