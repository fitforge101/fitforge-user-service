const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-token-validation-string';

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[auth-middleware] Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
// This is for authenticating the jwt tokens