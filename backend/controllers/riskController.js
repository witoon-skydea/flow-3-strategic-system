const db = require('../config/database');

// @desc    Get all risks
// @route   GET /api/risks
// @access  Private
const getRisks = (req, res) => {
  db.all('SELECT * FROM risks', (err, risks) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: risks.length,
      data: risks
    });
  });
};

// @desc    Get single risk
// @route   GET /api/risks/:id
// @access  Private
const getRisk = (req, res) => {
  db.get('SELECT * FROM risks WHERE risk_id = ?', [req.params.id], (err, risk) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }
    
    res.json({
      success: true,
      data: risk
    });
  });
};

// @desc    Create new risk
// @route   POST /api/risks
// @access  Private/Management
const createRisk = (req, res) => {
  const { 
    risk_plan_id, 
    strategy_plan_id, 
    action_item_id, 
    risk_description, 
    likelihood,
    impact,
    risk_score,
    mitigation_strategy,
    contingency_plan,
    responsible_person_id,
    status
  } = req.body;
  
  // Validate input
  if (!risk_description) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide risk description' 
    });
  }
  
  let validationsCompleted = 0;
  let validationErrors = null;
  const totalValidations = (risk_plan_id ? 1 : 0) + 
                          (strategy_plan_id ? 1 : 0) + 
                          (action_item_id ? 1 : 0) + 
                          (responsible_person_id ? 1 : 0);
  
  // If no IDs are provided, proceed with insert
  if (totalValidations === 0) {
    insertRisk();
    return;
  }
  
  // If risk plan ID is provided, check if it exists
  if (risk_plan_id) {
    db.get('SELECT * FROM risk_management_plans WHERE risk_plan_id = ?', [risk_plan_id], (err, plan) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (!plan) {
        validationErrors = 'Risk management plan not found';
      }
      
      validationsCompleted++;
      if (validationsCompleted === totalValidations) {
        if (validationErrors) {
          return res.status(404).json({ success: false, error: validationErrors });
        }
        insertRisk();
      }
    });
  }
  
  // If strategy plan ID is provided, check if it exists
  if (strategy_plan_id) {
    db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [strategy_plan_id], (err, plan) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (!plan) {
        validationErrors = 'Strategy plan not found';
      }
      
      validationsCompleted++;
      if (validationsCompleted === totalValidations) {
        if (validationErrors) {
          return res.status(404).json({ success: false, error: validationErrors });
        }
        insertRisk();
      }
    });
  }
  
  // If action item ID is provided, check if it exists
  if (action_item_id) {
    db.get('SELECT * FROM action_items WHERE action_item_id = ?', [action_item_id], (err, item) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (!item) {
        validationErrors = 'Action item not found';
      }
      
      validationsCompleted++;
      if (validationsCompleted === totalValidations) {
        if (validationErrors) {
          return res.status(404).json({ success: false, error: validationErrors });
        }
        insertRisk();
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
        insertRisk();
      }
    });
  }
  
  function insertRisk() {
    // Create risk
    db.run(
      `INSERT INTO risks 
        (risk_plan_id, strategy_plan_id, action_item_id, risk_description, 
        likelihood, impact, risk_score, mitigation_strategy, contingency_plan, 
        responsible_person_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        risk_plan_id,
        strategy_plan_id,
        action_item_id,
        risk_description,
        likelihood,
        impact,
        risk_score || 0,
        mitigation_strategy,
        contingency_plan,
        responsible_person_id,
        status || 'Identified'
      ],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Get created risk
        db.get(
          'SELECT * FROM risks WHERE risk_id = ?',
          [this.lastID],
          (err, risk) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            res.status(201).json({
              success: true,
              data: risk
            });
          }
        );
      }
    );
  }
};

// @desc    Update risk
// @route   PUT /api/risks/:id
// @access  Private/Management
const updateRisk = (req, res) => {
  const { 
    risk_plan_id, 
    strategy_plan_id, 
    action_item_id, 
    risk_description, 
    likelihood,
    impact,
    risk_score,
    mitigation_strategy,
    contingency_plan,
    responsible_person_id,
    status
  } = req.body;
  
  // Get existing risk
  db.get('SELECT * FROM risks WHERE risk_id = ?', [req.params.id], (err, risk) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }
    
    let validationsCompleted = 0;
    let validationErrors = null;
    const totalValidations = (risk_plan_id ? 1 : 0) + 
                            (strategy_plan_id ? 1 : 0) + 
                            (action_item_id ? 1 : 0) + 
                            (responsible_person_id ? 1 : 0);
    
    // If no IDs are provided, proceed with update
    if (totalValidations === 0) {
      updateRisk();
      return;
    }
    
    // If risk plan ID is provided, check if it exists
    if (risk_plan_id) {
      db.get('SELECT * FROM risk_management_plans WHERE risk_plan_id = ?', [risk_plan_id], (err, plan) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!plan) {
          validationErrors = 'Risk management plan not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateRisk();
        }
      });
    }
    
    // If strategy plan ID is provided, check if it exists
    if (strategy_plan_id) {
      db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [strategy_plan_id], (err, plan) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!plan) {
          validationErrors = 'Strategy plan not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateRisk();
        }
      });
    }
    
    // If action item ID is provided, check if it exists
    if (action_item_id) {
      db.get('SELECT * FROM action_items WHERE action_item_id = ?', [action_item_id], (err, item) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!item) {
          validationErrors = 'Action item not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateRisk();
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
          updateRisk();
        }
      });
    }
    
    function updateRisk() {
      // Update risk
      db.run(
        `UPDATE risks SET 
         risk_plan_id = ?,
         strategy_plan_id = ?,
         action_item_id = ?,
         risk_description = ?,
         likelihood = ?,
         impact = ?,
         risk_score = ?,
         mitigation_strategy = ?,
         contingency_plan = ?,
         responsible_person_id = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE risk_id = ?`,
        [
          risk_plan_id !== undefined ? risk_plan_id : risk.risk_plan_id,
          strategy_plan_id !== undefined ? strategy_plan_id : risk.strategy_plan_id,
          action_item_id !== undefined ? action_item_id : risk.action_item_id,
          risk_description || risk.risk_description,
          likelihood !== undefined ? likelihood : risk.likelihood,
          impact !== undefined ? impact : risk.impact,
          risk_score !== undefined ? risk_score : risk.risk_score,
          mitigation_strategy !== undefined ? mitigation_strategy : risk.mitigation_strategy,
          contingency_plan !== undefined ? contingency_plan : risk.contingency_plan,
          responsible_person_id !== undefined ? responsible_person_id : risk.responsible_person_id,
          status || risk.status,
          req.params.id
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated risk
          db.get(
            'SELECT * FROM risks WHERE risk_id = ?',
            [req.params.id],
            (err, updatedRisk) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.json({
                success: true,
                data: updatedRisk
              });
            }
          );
        }
      );
    }
  });
};

// @desc    Delete risk
// @route   DELETE /api/risks/:id
// @access  Private/Management
const deleteRisk = (req, res) => {
  // Check if risk exists
  db.get('SELECT * FROM risks WHERE risk_id = ?', [req.params.id], (err, risk) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }
    
    // Delete risk
    db.run('DELETE FROM risks WHERE risk_id = ?', [req.params.id], function(err) {
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
  getRisks,
  getRisk,
  createRisk,
  updateRisk,
  deleteRisk
};