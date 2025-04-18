const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please provide username and password' });
  }

  // Find user
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      
      // Return user data
      res.json({
        success: true,
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    });
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
};

module.exports = {
  login,
  getMe
};
