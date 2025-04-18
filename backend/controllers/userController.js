const bcrypt = require('bcryptjs');
const db = require('../config/database');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = (req, res) => {
  db.all('SELECT id, username, email, name, role, created_at, updated_at FROM users', (err, users) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  });
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = (req, res) => {
  db.get(
    'SELECT id, username, email, name, role, created_at, updated_at FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({
        success: true,
        data: user
      });
    }
  );
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
const createUser = (req, res) => {
  const { username, password, email, name, role } = req.body;
  
  // Validate input
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, error: 'Please provide username, password and role' });
  }
  
  // Validate role
  if (!['admin', 'management', 'staff'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Role must be admin, management, or staff' });
  }
  
  // Check if user exists
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    // Hash password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Create user
        db.run(
          'INSERT INTO users (username, password, email, name, role) VALUES (?, ?, ?, ?, ?)',
          [username, hash, email, name, role],
          function(err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            // Get created user
            db.get(
              'SELECT id, username, email, name, role, created_at, updated_at FROM users WHERE id = ?',
              [this.lastID],
              (err, user) => {
                if (err) {
                  console.error(err.message);
                  return res.status(500).json({ success: false, error: 'Server Error' });
                }
                
                res.status(201).json({
                  success: true,
                  data: user
                });
              }
            );
          }
        );
      });
    });
  });
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = (req, res) => {
  const { username, password, email, name, role } = req.body;
  
  // Get existing user
  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check if username/email is already taken by another user
    if (username || email) {
      db.get(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || user.username, email || user.email, req.params.id],
        (err, existingUser) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          if (existingUser) {
            return res.status(400).json({ success: false, error: 'Username or email already taken' });
          }
          
          updateUserData(user);
        }
      );
    } else {
      updateUserData(user);
    }
  });
  
  // Update user data
  function updateUserData(user) {
    // If password is provided, hash it
    if (password) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          updateUser(hash);
        });
      });
    } else {
      updateUser(user.password);
    }
    
    // Update user in database
    function updateUser(passwordHash) {
      const newUsername = username || user.username;
      const newEmail = email || user.email;
      const newName = name || user.name;
      const newRole = role || user.role;
      
      // Validate role
      if (!['admin', 'management', 'staff'].includes(newRole)) {
        return res.status(400).json({ success: false, error: 'Role must be admin, management, or staff' });
      }
      
      db.run(
        `UPDATE users SET 
         username = ?, 
         password = ?,
         email = ?,
         name = ?,
         role = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newUsername, passwordHash, newEmail, newName, newRole, req.params.id],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated user
          db.get(
            'SELECT id, username, email, name, role, created_at, updated_at FROM users WHERE id = ?',
            [req.params.id],
            (err, updatedUser) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.json({
                success: true,
                data: updatedUser
              });
            }
          );
        }
      );
    }
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = (req, res) => {
  // Prevent deleting the default admin account
  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (user.username === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot delete default admin account' });
    }
    
    // Delete user
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({
        success: true,
        data: {}
      });
    });
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
