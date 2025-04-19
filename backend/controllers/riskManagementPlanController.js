const db = require('../config/database');

// @desc    Get all risk management plans
// @route   GET /api/risk-management-plans
// @access  Private
const getRiskManagementPlans = (req, res) => {
  db.all('SELECT * FROM risk_management_plans', (err, plans) => {
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

// @desc    Get single risk management plan
// @route   GET /api/risk-management-plans/:id
// @access  Private
const getRiskManagementPlan = (req, res) => {
  db.get('SELECT * FROM risk_management_plans WHERE risk_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Risk management plan not found' });
    }
    
    res.json({
      success: true,
      data: plan
    });
  });
};

// @desc    Create new risk management plan
// @route   POST /api/risk-management-plans
// @access  Private/Management
const createRiskManagementPlan = (req, res) => {
  const { plan_name, description, year, status } = req.body;
  
  // Validate input
  if (!plan_name || !year) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide plan name and year' 
    });
  }
  
  // Create risk management plan
  db.run(
    `INSERT INTO risk_management_plans 
      (plan_name, description, year, status) 
    VALUES (?, ?, ?, ?)`,
    [
      plan_name,
      description,
      year,
      status || 'Draft'
    ],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      // Get created risk management plan
      db.get(
        'SELECT * FROM risk_management_plans WHERE risk_plan_id = ?',
        [this.lastID],
        (err, riskPlan) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          res.status(201).json({
            success: true,
            data: riskPlan
          });
        }
      );
    }
  );
};

// @desc    Update risk management plan
// @route   PUT /api/risk-management-plans/:id
// @access  Private/Management
const updateRiskManagementPlan = (req, res) => {
  const { plan_name, description, year, status } = req.body;
  
  // Get existing risk management plan
  db.get('SELECT * FROM risk_management_plans WHERE risk_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Risk management plan not found' });
    }
    
    // Update risk management plan
    db.run(
      `UPDATE risk_management_plans SET 
       plan_name = ?,
       description = ?,
       year = ?,
       status = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE risk_plan_id = ?`,
      [
        plan_name || plan.plan_name,
        description !== undefined ? description : plan.description,
        year !== undefined ? year : plan.year,
        status || plan.status,
        req.params.id
      ],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Get updated risk management plan
        db.get(
          'SELECT * FROM risk_management_plans WHERE risk_plan_id = ?',
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
  });
};

// @desc    Delete risk management plan
// @route   DELETE /api/risk-management-plans/:id
// @access  Private/Management
const deleteRiskManagementPlan = (req, res) => {
  // Check if risk management plan exists
  db.get('SELECT * FROM risk_management_plans WHERE risk_plan_id = ?', [req.params.id], (err, plan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Risk management plan not found' });
    }
    
    // Check if there are any risks associated with this plan
    db.get('SELECT COUNT(*) as count FROM risks WHERE risk_plan_id = ?', [req.params.id], (err, result) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      if (result.count > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete risk management plan with associated risks. Please delete risks first.' 
        });
      }
      
      // Delete risk management plan
      db.run('DELETE FROM risk_management_plans WHERE risk_plan_id = ?', [req.params.id], function(err) {
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
  getRiskManagementPlans,
  getRiskManagementPlan,
  createRiskManagementPlan,
  updateRiskManagementPlan,
  deleteRiskManagementPlan
};