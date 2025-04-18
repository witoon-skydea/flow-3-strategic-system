const db = require('../config/database');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private
const getOrganizations = (req, res) => {
  db.all('SELECT * FROM organizations', (err, organizations) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  });
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private
const getOrganization = (req, res) => {
  db.get('SELECT * FROM organizations WHERE org_id = ?', [req.params.id], (err, organization) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    
    res.json({
      success: true,
      data: organization
    });
  });
};

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private/Management
const createOrganization = (req, res) => {
  const { org_name, vision, mission } = req.body;
  
  // Validate input
  if (!org_name) {
    return res.status(400).json({ success: false, error: 'Please provide organization name' });
  }
  
  // Create organization
  db.run(
    'INSERT INTO organizations (org_name, vision, mission) VALUES (?, ?, ?)',
    [org_name, vision, mission],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      // Get created organization
      db.get(
        'SELECT * FROM organizations WHERE org_id = ?',
        [this.lastID],
        (err, organization) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          res.status(201).json({
            success: true,
            data: organization
          });
        }
      );
    }
  );
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Management
const updateOrganization = (req, res) => {
  const { org_name, vision, mission } = req.body;
  
  // Get existing organization
  db.get('SELECT * FROM organizations WHERE org_id = ?', [req.params.id], (err, organization) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    
    // Validate input
    if (!org_name) {
      return res.status(400).json({ success: false, error: 'Please provide organization name' });
    }
    
    // Update organization
    db.run(
      `UPDATE organizations SET 
       org_name = ?, 
       vision = ?,
       mission = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE org_id = ?`,
      [org_name, vision, mission, req.params.id],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Get updated organization
        db.get(
          'SELECT * FROM organizations WHERE org_id = ?',
          [req.params.id],
          (err, updatedOrganization) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            res.json({
              success: true,
              data: updatedOrganization
            });
          }
        );
      }
    );
  });
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/Management
const deleteOrganization = (req, res) => {
  // Check if organization exists
  db.get('SELECT * FROM organizations WHERE org_id = ?', [req.params.id], (err, organization) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    
    // Delete organization
    db.run('DELETE FROM organizations WHERE org_id = ?', [req.params.id], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      res.json({
        success: true,
        data: {}
      });
    });
  });
};

module.exports = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
};
