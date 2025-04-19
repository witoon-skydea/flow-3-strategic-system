const db = require('../config/database');

// @desc    Get all HR development initiatives
// @route   GET /api/hr-dev-initiatives
// @access  Private
const getHrDevInitiatives = (req, res) => {
  db.all('SELECT * FROM hr_dev_initiatives', (err, initiatives) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: initiatives.length,
      data: initiatives
    });
  });
};

// @desc    Get single HR development initiative
// @route   GET /api/hr-dev-initiatives/:id
// @access  Private
const getHrDevInitiative = (req, res) => {
  db.get('SELECT * FROM hr_dev_initiatives WHERE hr_initiative_id = ?', [req.params.id], (err, initiative) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'HR development initiative not found' });
    }
    
    res.json({
      success: true,
      data: initiative
    });
  });
};

// @desc    Create new HR development initiative
// @route   POST /api/hr-dev-initiatives
// @access  Private/Management
const createHrDevInitiative = (req, res) => {
  const { 
    hr_plan_id, 
    initiative_name, 
    description, 
    required_competencies, 
    training_resources,
    budget,
    responsible_person_id,
    status,
    progress
  } = req.body;
  
  // Validate input
  if (!hr_plan_id || !initiative_name) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide HR plan ID and initiative name' 
    });
  }
  
  // Check if HR plan exists
  db.get('SELECT * FROM hr_dev_plans WHERE hr_plan_id = ?', [hr_plan_id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'HR development plan not found' });
    }
    
    // If responsible person is provided, check if user exists
    if (responsible_person_id) {
      db.get('SELECT * FROM users WHERE id = ?', [responsible_person_id], (err, user) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!user) {
          return res.status(404).json({ success: false, error: 'Responsible person not found' });
        }
        
        insertInitiative();
      });
    } else {
      insertInitiative();
    }
    
    function insertInitiative() {
      // Create HR development initiative
      db.run(
        `INSERT INTO hr_dev_initiatives 
          (hr_plan_id, initiative_name, description, required_competencies, 
          training_resources, budget, responsible_person_id, status, progress) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hr_plan_id, 
          initiative_name, 
          description, 
          required_competencies, 
          training_resources,
          budget,
          responsible_person_id,
          status || 'Not Started',
          progress || 0
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get created HR development initiative
          db.get(
            'SELECT * FROM hr_dev_initiatives WHERE hr_initiative_id = ?',
            [this.lastID],
            (err, initiative) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.status(201).json({
                success: true,
                data: initiative
              });
            }
          );
        }
      );
    }
  });
};

// @desc    Update HR development initiative
// @route   PUT /api/hr-dev-initiatives/:id
// @access  Private/Management
const updateHrDevInitiative = (req, res) => {
  const { 
    hr_plan_id, 
    initiative_name, 
    description, 
    required_competencies, 
    training_resources,
    budget,
    responsible_person_id,
    status,
    progress
  } = req.body;
  
  // Get existing HR development initiative
  db.get('SELECT * FROM hr_dev_initiatives WHERE hr_initiative_id = ?', [req.params.id], (err, initiative) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'HR development initiative not found' });
    }
    
    let validationsCompleted = 0;
    let validationErrors = null;
    const totalValidations = (hr_plan_id ? 1 : 0) + (responsible_person_id ? 1 : 0);
    
    // If HR plan ID is provided, check if it exists
    if (hr_plan_id) {
      db.get('SELECT * FROM hr_dev_plans WHERE hr_plan_id = ?', [hr_plan_id], (err, plan) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!plan) {
          validationErrors = 'HR development plan not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateInitiative();
        }
      });
    }
    
    // If responsible person ID is provided, check if user exists
    if (responsible_person_id) {
      db.get('SELECT * FROM users WHERE id = ?', [responsible_person_id], (err, user) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!user) {
          validationErrors = 'Responsible person not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateInitiative();
        }
      });
    }
    
    // If no validations are needed, proceed with update
    if (totalValidations === 0) {
      updateInitiative();
    }
    
    function updateInitiative() {
      // Update HR development initiative
      db.run(
        `UPDATE hr_dev_initiatives SET 
         hr_plan_id = ?, 
         initiative_name = ?,
         description = ?,
         required_competencies = ?,
         training_resources = ?,
         budget = ?,
         responsible_person_id = ?,
         status = ?,
         progress = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE hr_initiative_id = ?`,
        [
          hr_plan_id || initiative.hr_plan_id,
          initiative_name || initiative.initiative_name,
          description !== undefined ? description : initiative.description,
          required_competencies !== undefined ? required_competencies : initiative.required_competencies,
          training_resources !== undefined ? training_resources : initiative.training_resources,
          budget !== undefined ? budget : initiative.budget,
          responsible_person_id !== undefined ? responsible_person_id : initiative.responsible_person_id,
          status || initiative.status,
          progress !== undefined ? progress : initiative.progress,
          req.params.id
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated HR development initiative
          db.get(
            'SELECT * FROM hr_dev_initiatives WHERE hr_initiative_id = ?',
            [req.params.id],
            (err, updatedInitiative) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.json({
                success: true,
                data: updatedInitiative
              });
            }
          );
        }
      );
    }
  });
};

// @desc    Delete HR development initiative
// @route   DELETE /api/hr-dev-initiatives/:id
// @access  Private/Management
const deleteHrDevInitiative = (req, res) => {
  // Check if HR development initiative exists
  db.get('SELECT * FROM hr_dev_initiatives WHERE hr_initiative_id = ?', [req.params.id], (err, initiative) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'HR development initiative not found' });
    }
    
    // Delete HR development initiative
    db.run('DELETE FROM hr_dev_initiatives WHERE hr_initiative_id = ?', [req.params.id], function(err) {
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
  getHrDevInitiatives,
  getHrDevInitiative,
  createHrDevInitiative,
  updateHrDevInitiative,
  deleteHrDevInitiative
};