const db = require('../config/database');

// @desc    Get all action items
// @route   GET /api/action-items
// @access  Private
const getActionItems = (req, res) => {
  db.all('SELECT * FROM action_items', (err, items) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  });
};

// @desc    Get single action item
// @route   GET /api/action-items/:id
// @access  Private
const getActionItem = (req, res) => {
  db.get('SELECT * FROM action_items WHERE action_item_id = ?', [req.params.id], (err, item) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Action item not found' });
    }
    
    res.json({
      success: true,
      data: item
    });
  });
};

// @desc    Create new action item
// @route   POST /api/action-items
// @access  Private/Management
const createActionItem = (req, res) => {
  const { 
    action_plan_id, 
    goal_id, 
    item_description, 
    responsible_department_id, 
    responsible_person_id,
    start_date,
    due_date,
    kpi,
    kpi_target,
    kpi_actual,
    budget,
    status,
    progress,
    progress_update
  } = req.body;
  
  // Validate input
  if (!action_plan_id || !item_description) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide action plan ID and item description' 
    });
  }
  
  // Check if action plan exists
  db.get('SELECT * FROM action_plans WHERE action_plan_id = ?', [action_plan_id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Action plan not found' });
    }
    
    let validationsCompleted = 0;
    let validationErrors = null;
    const totalValidations = (goal_id ? 1 : 0) + 
                            (responsible_department_id ? 1 : 0) + 
                            (responsible_person_id ? 1 : 0);
    
    // If goal ID is provided, check if it exists
    if (goal_id) {
      db.get('SELECT * FROM strategic_goals WHERE goal_id = ?', [goal_id], (err, goal) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!goal) {
          validationErrors = 'Strategic goal not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          insertActionItem();
        }
      });
    }
    
    // If department ID is provided, check if it exists
    if (responsible_department_id) {
      db.get('SELECT * FROM departments WHERE department_id = ?', [responsible_department_id], (err, department) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!department) {
          validationErrors = 'Department not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          insertActionItem();
        }
      });
    }
    
    // If person ID is provided, check if it exists
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
          insertActionItem();
        }
      });
    }
    
    // If no validations are needed, proceed with insert
    if (totalValidations === 0) {
      insertActionItem();
    }
    
    function insertActionItem() {
      // Create action item
      db.run(
        `INSERT INTO action_items 
          (action_plan_id, goal_id, item_description, responsible_department_id, 
          responsible_person_id, start_date, due_date, kpi, kpi_target, kpi_actual,
          budget, status, progress, progress_update) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          action_plan_id,
          goal_id, 
          item_description, 
          responsible_department_id, 
          responsible_person_id,
          start_date,
          due_date,
          kpi,
          kpi_target,
          kpi_actual,
          budget,
          status || 'Not Started',
          progress || 0,
          progress_update
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get created action item
          db.get(
            'SELECT * FROM action_items WHERE action_item_id = ?',
            [this.lastID],
            (err, actionItem) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.status(201).json({
                success: true,
                data: actionItem
              });
            }
          );
        }
      );
    }
  });
};

// @desc    Update action item
// @route   PUT /api/action-items/:id
// @access  Private/Management
const updateActionItem = (req, res) => {
  const { 
    action_plan_id, 
    goal_id, 
    item_description, 
    responsible_department_id, 
    responsible_person_id,
    start_date,
    due_date,
    kpi,
    kpi_target,
    kpi_actual,
    budget,
    status,
    progress,
    progress_update
  } = req.body;
  
  // Get existing action item
  db.get('SELECT * FROM action_items WHERE action_item_id = ?', [req.params.id], (err, item) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Action item not found' });
    }
    
    let validationsCompleted = 0;
    let validationErrors = null;
    const totalValidations = (action_plan_id ? 1 : 0) + 
                            (goal_id ? 1 : 0) + 
                            (responsible_department_id ? 1 : 0) + 
                            (responsible_person_id ? 1 : 0);
    
    // If action plan ID is provided, check if it exists
    if (action_plan_id) {
      db.get('SELECT * FROM action_plans WHERE action_plan_id = ?', [action_plan_id], (err, plan) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!plan) {
          validationErrors = 'Action plan not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateActionItem();
        }
      });
    }
    
    // If goal ID is provided, check if it exists
    if (goal_id) {
      db.get('SELECT * FROM strategic_goals WHERE goal_id = ?', [goal_id], (err, goal) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!goal) {
          validationErrors = 'Strategic goal not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateActionItem();
        }
      });
    }
    
    // If department ID is provided, check if it exists
    if (responsible_department_id) {
      db.get('SELECT * FROM departments WHERE department_id = ?', [responsible_department_id], (err, department) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!department) {
          validationErrors = 'Department not found';
        }
        
        validationsCompleted++;
        if (validationsCompleted === totalValidations) {
          if (validationErrors) {
            return res.status(404).json({ success: false, error: validationErrors });
          }
          updateActionItem();
        }
      });
    }
    
    // If person ID is provided, check if it exists
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
          updateActionItem();
        }
      });
    }
    
    // If no validations are needed, proceed with update
    if (totalValidations === 0) {
      updateActionItem();
    }
    
    function updateActionItem() {
      // Update action item
      db.run(
        `UPDATE action_items SET 
         action_plan_id = ?,
         goal_id = ?,
         item_description = ?,
         responsible_department_id = ?,
         responsible_person_id = ?,
         start_date = ?,
         due_date = ?,
         kpi = ?,
         kpi_target = ?,
         kpi_actual = ?,
         budget = ?,
         status = ?,
         progress = ?,
         progress_update = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE action_item_id = ?`,
        [
          action_plan_id || item.action_plan_id,
          goal_id !== undefined ? goal_id : item.goal_id,
          item_description || item.item_description,
          responsible_department_id !== undefined ? responsible_department_id : item.responsible_department_id,
          responsible_person_id !== undefined ? responsible_person_id : item.responsible_person_id,
          start_date !== undefined ? start_date : item.start_date,
          due_date !== undefined ? due_date : item.due_date,
          kpi !== undefined ? kpi : item.kpi,
          kpi_target !== undefined ? kpi_target : item.kpi_target,
          kpi_actual !== undefined ? kpi_actual : item.kpi_actual,
          budget !== undefined ? budget : item.budget,
          status || item.status,
          progress !== undefined ? progress : item.progress,
          progress_update !== undefined ? progress_update : item.progress_update,
          req.params.id
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated action item
          db.get(
            'SELECT * FROM action_items WHERE action_item_id = ?',
            [req.params.id],
            (err, updatedItem) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.json({
                success: true,
                data: updatedItem
              });
            }
          );
        }
      );
    }
  });
};

// @desc    Delete action item
// @route   DELETE /api/action-items/:id
// @access  Private/Management
const deleteActionItem = (req, res) => {
  // Check if action item exists
  db.get('SELECT * FROM action_items WHERE action_item_id = ?', [req.params.id], (err, item) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Action item not found' });
    }
    
    // Check if there are any risks associated with this action item
    db.get('SELECT COUNT(*) as count FROM risks WHERE action_item_id = ?', [req.params.id], (err, result) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (result.count > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete action item with associated risks. Please delete risks first.' 
        });
      }
      
      // Delete action item
      db.run('DELETE FROM action_items WHERE action_item_id = ?', [req.params.id], function(err) {
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
  });
};

module.exports = {
  getActionItems,
  getActionItem,
  createActionItem,
  updateActionItem,
  deleteActionItem
};