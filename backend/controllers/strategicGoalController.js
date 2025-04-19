const db = require('../config/database');

// @desc    Get all strategic goals
// @route   GET /api/strategic-goals
// @access  Private
const getStrategicGoals = (req, res) => {
  db.all('SELECT * FROM strategic_goals', (err, goals) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: goals.length,
      data: goals
    });
  });
};

// @desc    Get single strategic goal
// @route   GET /api/strategic-goals/:id
// @access  Private
const getStrategicGoal = (req, res) => {
  db.get('SELECT * FROM strategic_goals WHERE goal_id = ?', [req.params.id], (err, goal) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Strategic goal not found' });
    }
    
    res.json({
      success: true,
      data: goal
    });
  });
};

// @desc    Create new strategic goal
// @route   POST /api/strategic-goals
// @access  Private/Management
const createStrategicGoal = (req, res) => {
  const { 
    strategy_plan_id, 
    goal_description, 
    target_metric, 
    target_value, 
    deadline,
    actual_value,
    progress
  } = req.body;
  
  // Validate input
  if (!strategy_plan_id || !goal_description) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide strategy plan ID and goal description' 
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
    
    // Create strategic goal
    db.run(
      `INSERT INTO strategic_goals 
        (strategy_plan_id, goal_description, target_metric, target_value, 
        deadline, actual_value, progress) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        strategy_plan_id, 
        goal_description, 
        target_metric, 
        target_value, 
        deadline, 
        actual_value, 
        progress || 0
      ],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        // Get created strategic goal
        db.get(
          'SELECT * FROM strategic_goals WHERE goal_id = ?',
          [this.lastID],
          (err, goal) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            res.status(201).json({
              success: true,
              data: goal
            });
          }
        );
      }
    );
  });
};

// @desc    Update strategic goal
// @route   PUT /api/strategic-goals/:id
// @access  Private/Management
const updateStrategicGoal = (req, res) => {
  const { 
    strategy_plan_id, 
    goal_description, 
    target_metric, 
    target_value, 
    deadline,
    actual_value,
    progress
  } = req.body;
  
  // Get existing strategic goal
  db.get('SELECT * FROM strategic_goals WHERE goal_id = ?', [req.params.id], (err, goal) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Strategic goal not found' });
    }
    
    // Validate input
    if (strategy_plan_id) {
      // Check if strategy plan exists
      db.get('SELECT * FROM strategy_plans WHERE strategy_plan_id = ?', [strategy_plan_id], (err, plan) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        if (!plan) {
          return res.status(404).json({ success: false, error: 'Strategy plan not found' });
        }
        
        updateGoal();
      });
    } else {
      updateGoal();
    }
    
    function updateGoal() {
      // Update strategic goal
      db.run(
        `UPDATE strategic_goals SET 
         strategy_plan_id = ?, 
         goal_description = ?,
         target_metric = ?,
         target_value = ?,
         deadline = ?,
         actual_value = ?,
         progress = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE goal_id = ?`,
        [
          strategy_plan_id || goal.strategy_plan_id,
          goal_description || goal.goal_description,
          target_metric !== undefined ? target_metric : goal.target_metric,
          target_value !== undefined ? target_value : goal.target_value,
          deadline !== undefined ? deadline : goal.deadline,
          actual_value !== undefined ? actual_value : goal.actual_value,
          progress !== undefined ? progress : goal.progress,
          req.params.id
        ],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          // Get updated strategic goal
          db.get(
            'SELECT * FROM strategic_goals WHERE goal_id = ?',
            [req.params.id],
            (err, updatedGoal) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              res.json({
                success: true,
                data: updatedGoal
              });
            }
          );
        }
      );
    }
  });
};

// @desc    Delete strategic goal
// @route   DELETE /api/strategic-goals/:id
// @access  Private/Management
const deleteStrategicGoal = (req, res) => {
  // Check if strategic goal exists
  db.get('SELECT * FROM strategic_goals WHERE goal_id = ?', [req.params.id], (err, goal) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Strategic goal not found' });
    }
    
    // Delete strategic goal
    db.run('DELETE FROM strategic_goals WHERE goal_id = ?', [req.params.id], function(err) {
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
  getStrategicGoals,
  getStrategicGoal,
  createStrategicGoal,
  updateStrategicGoal,
  deleteStrategicGoal
};