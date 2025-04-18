const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware to protect routes
const protect = (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Query the user
      db.get('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!user) {
          return res.status(401).json({ success: false, error: 'User not found' });
        }
        
        // Set user in request
        req.user = user;
        next();
      });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

// Admin access middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'Not authorized as admin' });
  }
};

// Management access middleware
const management = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'management')) {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'Not authorized as management' });
  }
};

module.exports = { protect, admin, management };
