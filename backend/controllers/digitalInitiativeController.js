const db = require('../config/database');

// @desc    Get all digital initiatives
// @route   GET /api/digital-initiatives
// @access  Private
const getDigitalInitiatives = (req, res) => {
  db.all('SELECT * FROM digital_initiatives', (err, initiatives) => {
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

// @desc    Get single digital initiative
// @route   GET /api/digital-initiatives/:id
// @access  Private
const getDigitalInitiative = (req, res) => {
  db.get('SELECT * FROM digital_initiatives WHERE digital_initiative_id = ?', [req.params.id], (err, initiative) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Digital initiative not found' });
    }
    
    res.json({
      success: true,
      data: initiative
    });
  });
};

// @desc    Create new digital initiative
// @route   POST /api/digital-initiatives
// @access  Private/Management
const createDigitalInitiative = (req, res) => {
  const { 
    digital_plan_id, 
    initiative_name, 
    description, 
    technology_stack, 
    required_infrastructure,
    budget,
    responsible_person_id,
    status,
    progress
  } = req.body;
  
  // Validate input
  if (!digital_plan_id || !initiative_name) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide digital plan ID and initiative name' 
    });
  }
  
  // Check if digital plan exists
  db.get('SELECT * FROM digital_dev_plans WHERE digital_plan_id = ?', [digital_plan_id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Digital development plan not found' });
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
      // Create digital initiative
      db.run(
        `INSERT INTO digital_initiatives 
          (digital_plan_id, initiative_name, description, technology_stack, 
          required_infrastructure, budget, responsible_person_id, status, progress) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          digital_plan_id, 
          initiative_name, 
          description, 
          technology_stack, 
          required_infrastructure,
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
          
          // Get created digital initiative
          db.get(
            'SELECT * FROM digital_initiatives WHERE digital_initiative_id = ?',
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

// @desc    Update digital initiative
// @route   PUT /api/digital-initiatives/:id
// @access  Private/Management
const updateDigitalInitiative = (req, res) => {
  const { 
    digital_plan_id, 
    initiative_name, 
    description, 
    technology_stack, 
    required_infrastructure,
    budget,
    responsible_person_id,
    status,
    progress
  } = req.body;
  
  // Get existing digital initiative
  db.get('SELECT * FROM digital_initiatives WHERE digital_initiative_id = ?', [req.params.id], (err, initiative) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Digital initiative not found' });
    }
    
    let validationsCompleted = 0;
    let validationErrors = null;
    const totalValidations = (digital_plan_id ? 1 : 0) + (responsible_person_id ? 1 : 0);
    
    // If digital plan ID is provided, check if it exists
    if (digital_plan_id) {
      db.get('SELECT * FROM digital_dev_plans WHERE digital_plan_id = ?', [digital_plan_id], (err, plan) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!plan) {
          validationErrors = 'Digital development plan not found';
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
      // Update digital initiative
      db.run(
        `UPDATE digital_initiatives SET 
         digital_plan_id = ?, 
         initiative_name = ?,
         description = ?,
         technology_stack = ?,
         required_infrastructure = ?,
         budget = ?,
         responsible_person_id = ?,
         status = ?,
         progress = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE digital_initiative_id = ?`,
        [
          digital_plan_id || initiative.digital_plan_id,
          initiative_name || initiative.initiative_name,
          description !== undefined ? description : initiative.description,
          technology_stack !== undefined ? technology_stack : initiative.technology_stack,
          required_infrastructure !== undefined ? required_infrastructure : initiative.required_infrastructure,
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
          
          // Get updated digital initiative
          db.get(
            'SELECT * FROM digital_initiatives WHERE digital_initiative_id = ?',
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

// @desc    Delete digital initiative
// @route   DELETE /api/digital-initiatives/:id
// @access  Private/Management
const deleteDigitalInitiative = (req, res) => {
  // Check if digital initiative exists
  db.get('SELECT * FROM digital_initiatives WHERE digital_initiative_id = ?', [req.params.id], (err, initiative) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Digital initiative not found' });
    }
    
    // Delete digital initiative
    db.run('DELETE FROM digital_initiatives WHERE digital_initiative_id = ?', [req.params.id], function(err) {
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
  getDigitalInitiatives,
  getDigitalInitiative,
  createDigitalInitiative,
  updateDigitalInitiative,
  deleteDigitalInitiative
};