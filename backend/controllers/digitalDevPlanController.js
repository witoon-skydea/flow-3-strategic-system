const db = require('../config/database');

// @desc    Get all digital development plans
// @route   GET /api/digital-dev-plans
// @access  Private
const getDigitalDevPlans = (req, res) => {
  db.all('SELECT * FROM digital_dev_plans', (err, plans) => {
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

// @desc    Get single digital development plan
// @route   GET /api/digital-dev-plans/:id
// @access  Private
const getDigitalDevPlan = (req, res) => {
  db.get('SELECT * FROM digital_dev_plans WHERE digital_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Digital development plan not found' });
    }
    
    res.json({
      success: true,
      data: plan
    });
  });
};

// @desc    Create new digital development plan
// @route   POST /api/digital-dev-plans
// @access  Private/Management
const createDigitalDevPlan = (req, res) => {
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
    
    // Create digital development plan
    db.run(
      `INSERT INTO digital_dev_plans 
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
        
        // Get created digital development plan
        db.get(
          'SELECT * FROM digital_dev_plans WHERE digital_plan_id = ?',
          [this.lastID],
          (err, digitalPlan) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            res.status(201).json({
              success: true,
              data: digitalPlan
            });
          }
        );
      }
    );
  });
};

// @desc    Update digital development plan
// @route   PUT /api/digital-dev-plans/:id
// @access  Private/Management
const updateDigitalDevPlan = (req, res) => {
  const { strategy_plan_id, plan_name, start_date, end_date, description, status } = req.body;
  
  // Get existing digital development plan
  db.get('SELECT * FROM digital_dev_plans WHERE digital_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Digital development plan not found' });
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
      // Update digital development plan
      db.run(
        `UPDATE digital_dev_plans SET 
         strategy_plan_id = ?, 
         plan_name = ?,
         start_date = ?,
         end_date = ?,
         description = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE digital_plan_id = ?`,
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
          
          // Get updated digital development plan
          db.get(
            'SELECT * FROM digital_dev_plans WHERE digital_plan_id = ?',
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

// @desc    Delete digital development plan
// @route   DELETE /api/digital-dev-plans/:id
// @access  Private/Management
const deleteDigitalDevPlan = (req, res) => {
  // Check if digital development plan exists
  db.get('SELECT * FROM digital_dev_plans WHERE digital_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Digital development plan not found' });
    }
    
    // Delete digital development plan
    db.run('DELETE FROM digital_dev_plans WHERE digital_plan_id = ?', [req.params.id], function(err) {
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
  getDigitalDevPlans,
  getDigitalDevPlan,
  createDigitalDevPlan,
  updateDigitalDevPlan,
  deleteDigitalDevPlan
};