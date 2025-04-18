const db = require('../config/database');

// @desc    Get all strategy plans
// @route   GET /api/strategy-plans
// @access  Private
const getStrategyPlans = (req, res) => {
  db.all('SELECT * FROM strategy_plans', (err, plans) => {
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

// @desc    Get single strategy plan
// @route   GET /api/strategy-plans/:id
// @access  Private
const getStrategyPlan = (req, res) => {
  db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Strategy plan not found' });
    }
    
    res.json({
      success: true,
      data: plan
    });
  });
};

// @desc    Create new strategy plan
// @route   POST /api/strategy-plans
// @access  Private/Management
const createStrategyPlan = (req, res) => {
  const { org_id, plan_name, start_date, end_date, description, status } = req.body;
  
  // Validate input
  if (!org_id || !plan_name) {
    return res.status(400).json({ success: false, error: 'Please provide organization ID and plan name' });
  }
  
  // Check if organization exists
  db.get('SELECT * FROM organizations WHERE org_id = ?', [org_id], (err, organization) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    
    // Create strategy plan
    db.run(
      'INSERT INTO strategy_plans (org_id, plan_name, start_date, end_date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [org_id, plan_name, start_date, end_date, description, status || 'Draft'],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Get created strategy plan
        db.get(
          'SELECT * FROM strategy_plans WHERE strategy_plan_id = ?',
          [this.lastID],
          (err, plan) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            res.status(201).json({
              success: true,
              data: plan
            });
          }
        );
      }
    );
  });
};

// @desc    Update strategy plan
// @route   PUT /api/strategy-plans/:id
// @access  Private/Management
const updateStrategyPlan = (req, res) => {
  const { org_id, plan_name, start_date, end_date, description, status } = req.body;
  
  // Get existing strategy plan
  db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Strategy plan not found' });
    }
    
    // Validate input
    if (org_id) {
      // Check if organization exists
      db.get('SELECT * FROM organizations WHERE org_id = ?', [org_id], (err, organization) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!organization) {
          return res.status(404).json({ success: false, error: 'Organization not found' });
        }
        
        updatePlan();
      });
    } else {
      updatePlan();
    }
    
    function updatePlan() {
      // Update strategy plan
      db.run(
        `UPDATE strategy_plans SET 
         org_id = ?, 
         plan_name = ?,
         start_date = ?,
         end_date = ?,
         description = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE strategy_plan_id = ?`,
        [
          org_id || plan.org_id,
          plan_name || plan.plan_name,
          start_date || plan.start_date,
          end_date || plan.end_date,
          description !== undefined ? description : plan.description,
          status || plan.status,
          req.params.id
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated strategy plan
          db.get(
            'SELECT * FROM strategy_plans WHERE strategy_plan_id = ?',
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

// @desc    Delete strategy plan
// @route   DELETE /api/strategy-plans/:id
// @access  Private/Management
const deleteStrategyPlan = (req, res) => {
  // Check if strategy plan exists
  db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Strategy plan not found' });
    }
    
    // Delete strategy plan
    db.run('DELETE FROM strategy_plans WHERE strategy_plan_id = ?', [req.params.id], function(err) {
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
  getStrategyPlans,
  getStrategyPlan,
  createStrategyPlan,
  updateStrategyPlan,
  deleteStrategyPlan
};
