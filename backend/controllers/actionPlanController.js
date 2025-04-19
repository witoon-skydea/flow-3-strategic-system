const db = require('../config/database');

// @desc    Get all action plans
// @route   GET /api/action-plans
// @access  Private
const getActionPlans = (req, res) => {
  db.all('SELECT * FROM action_plans', (err, plans) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  });
};

// @desc    Get single action plan
// @route   GET /api/action-plans/:id
// @access  Private
const getActionPlan = (req, res) => {
  db.get('SELECT * FROM action_plans WHERE action_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Action plan not found' });
    }
    
    res.json({
      success: true,
      data: plan
    });
  });
};

// @desc    Create new action plan
// @route   POST /api/action-plans
// @access  Private/Management
const createActionPlan = (req, res) => {
  const { strategy_plan_id, year, plan_name, description, status } = req.body;
  
  // Validate input
  if (!strategy_plan_id || !plan_name || !year) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide strategy plan ID, year, and plan name' 
    });
  }
  
  // Check if strategy plan exists
  db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [strategy_plan_id], (err, strategyPlan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!strategyPlan) {
      return res.status(404).json({ success: false, error: 'Strategy plan not found' });
    }
    
    // Create action plan
    db.run(
      `INSERT INTO action_plans 
        (strategy_plan_id, year, plan_name, description, status) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        strategy_plan_id,
        year,
        plan_name,
        description,
        status || 'Draft'
      ],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Get created action plan
        db.get(
          'SELECT * FROM action_plans WHERE action_plan_id = ?',
          [this.lastID],
          (err, actionPlan) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            res.status(201).json({
              success: true,
              data: actionPlan
            });
          }
        );
      }
    );
  });
};

// @desc    Update action plan
// @route   PUT /api/action-plans/:id
// @access  Private/Management
const updateActionPlan = (req, res) => {
  const { strategy_plan_id, year, plan_name, description, status } = req.body;
  
  // Get existing action plan
  db.get('SELECT * FROM action_plans WHERE action_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Action plan not found' });
    }
    
    // Validate input
    if (strategy_plan_id) {
      // Check if strategy plan exists
      db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [strategy_plan_id], (err, strategyPlan) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!strategyPlan) {
          return res.status(404).json({ success: false, error: 'Strategy plan not found' });
        }
        
        updatePlan();
      });
    } else {
      updatePlan();
    }
    
    function updatePlan() {
      // Update action plan
      db.run(
        `UPDATE action_plans SET 
         strategy_plan_id = ?, 
         year = ?,
         plan_name = ?,
         description = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE action_plan_id = ?`,
        [
          strategy_plan_id || plan.strategy_plan_id,
          year !== undefined ? year : plan.year,
          plan_name || plan.plan_name,
          description !== undefined ? description : plan.description,
          status || plan.status,
          req.params.id
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated action plan
          db.get(
            'SELECT * FROM action_plans WHERE action_plan_id = ?',
            [req.params.id],
            (err, updatedPlan) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.json({
                success: true,
                data: updatedPlan
              });
            }
          );
        }
      );
    }
  });
};

// @desc    Delete action plan
// @route   DELETE /api/action-plans/:id
// @access  Private/Management
const deleteActionPlan = (req, res) => {
  // Check if action plan exists
  db.get('SELECT * FROM action_plans WHERE action_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Action plan not found' });
    }
    
    // Check if there are any action items associated with this plan
    db.get('SELECT COUNT(*) as count FROM action_items WHERE action_plan_id = ?', [req.params.id], (err, result) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (result.count > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete action plan with associated action items. Please delete action items first.' 
        });
      }
      
      // Delete action plan
      db.run('DELETE FROM action_plans WHERE action_plan_id = ?', [req.params.id], function(err) {
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
  getActionPlans,
  getActionPlan,
  createActionPlan,
  updateActionPlan,
  deleteActionPlan
};