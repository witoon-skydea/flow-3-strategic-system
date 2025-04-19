const db = require('../config/database');

// @desc    Get all HR development plans
// @route   GET /api/hr-dev-plans
// @access  Private
const getHrDevPlans = (req, res) => {
  db.all('SELECT * FROM hr_dev_plans', (err, plans) => {
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

// @desc    Get single HR development plan
// @route   GET /api/hr-dev-plans/:id
// @access  Private
const getHrDevPlan = (req, res) => {
  db.get('SELECT * FROM hr_dev_plans WHERE hr_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'HR development plan not found' });
    }
    
    res.json({
      success: true,
      data: plan
    });
  });
};

// @desc    Create new HR development plan
// @route   POST /api/hr-dev-plans
// @access  Private/Management
const createHrDevPlan = (req, res) => {
  const { strategy_plan_id, plan_name, start_date, end_date, description, status } = req.body;
  
  // Validate input
  if (!strategy_plan_id || !plan_name) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide strategy plan ID and plan name' 
    });
  }
  
  // Check if strategy plan exists
  db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [strategy_plan_id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Strategy plan not found' });
    }
    
    // Create HR development plan
    db.run(
      `INSERT INTO hr_dev_plans 
        (strategy_plan_id, plan_name, start_date, end_date, description, status) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        strategy_plan_id, 
        plan_name, 
        start_date, 
        end_date, 
        description, 
        status || 'Draft'
      ],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Get created HR development plan
        db.get(
          'SELECT * FROM hr_dev_plans WHERE hr_plan_id = ?',
          [this.lastID],
          (err, hrPlan) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            res.status(201).json({
              success: true,
              data: hrPlan
            });
          }
        );
      }
    );
  });
};

// @desc    Update HR development plan
// @route   PUT /api/hr-dev-plans/:id
// @access  Private/Management
const updateHrDevPlan = (req, res) => {
  const { strategy_plan_id, plan_name, start_date, end_date, description, status } = req.body;
  
  // Get existing HR development plan
  db.get('SELECT * FROM hr_dev_plans WHERE hr_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'HR development plan not found' });
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
      // Update HR development plan
      db.run(
        `UPDATE hr_dev_plans SET 
         strategy_plan_id = ?, 
         plan_name = ?,
         start_date = ?,
         end_date = ?,
         description = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE hr_plan_id = ?`,
        [
          strategy_plan_id || plan.strategy_plan_id,
          plan_name || plan.plan_name,
          start_date !== undefined ? start_date : plan.start_date,
          end_date !== undefined ? end_date : plan.end_date,
          description !== undefined ? description : plan.description,
          status || plan.status,
          req.params.id
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated HR development plan
          db.get(
            'SELECT * FROM hr_dev_plans WHERE hr_plan_id = ?',
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

// @desc    Delete HR development plan
// @route   DELETE /api/hr-dev-plans/:id
// @access  Private/Management
const deleteHrDevPlan = (req, res) => {
  // Check if HR development plan exists
  db.get('SELECT * FROM hr_dev_plans WHERE hr_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'HR development plan not found' });
    }
    
    // Delete HR development plan
    db.run('DELETE FROM hr_dev_plans WHERE hr_plan_id = ?', [req.params.id], function(err) {
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
  getHrDevPlans,
  getHrDevPlan,
  createHrDevPlan,
  updateHrDevPlan,
  deleteHrDevPlan
};