const db = require('../config/database');

// @desc    Get overview dashboard data
// @route   GET /api/dashboard/overview
// @access  Private
const getOverview = (req, res) => {
  // Create an object to store all dashboard data
  const dashboardData = {
    strategicGoalsCount: 0,
    hrInitiativesCount: 0,
    digitalInitiativesCount: 0,
    actionItemsCount: 0,
    risksCount: 0,
    strategicGoalsProgress: 0,
    hrInitiativesProgress: 0,
    digitalInitiativesProgress: 0,
    actionItemsProgress: 0,
    riskStatusSummary: {},
    recentActivity: []
  };

  // Get strategic goals count and average progress
  db.get(`
    SELECT 
      COUNT(*) as count,
      AVG(progress) as avgProgress
    FROM strategic_goals
  `, (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    dashboardData.strategicGoalsCount = result.count;
    dashboardData.strategicGoalsProgress = result.avgProgress || 0;
    
    // Get HR initiatives count and average progress
    db.get(`
      SELECT 
        COUNT(*) as count,
        AVG(progress) as avgProgress
      FROM hr_dev_initiatives
    `, (err, result) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      
      dashboardData.hrInitiativesCount = result.count;
      dashboardData.hrInitiativesProgress = result.avgProgress || 0;
      
      // Get digital initiatives count and average progress
      db.get(`
        SELECT 
          COUNT(*) as count,
          AVG(progress) as avgProgress
        FROM digital_initiatives
      `, (err, result) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, error: 'Server Error' });
        }
        
        dashboardData.digitalInitiativesCount = result.count;
        dashboardData.digitalInitiativesProgress = result.avgProgress || 0;
        
        // Get action items count and average progress
        db.get(`
          SELECT 
            COUNT(*) as count,
            AVG(progress) as avgProgress
          FROM action_items
        `, (err, result) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: 'Server Error' });
          }
          
          dashboardData.actionItemsCount = result.count;
          dashboardData.actionItemsProgress = result.avgProgress || 0;
          
          // Get risks count and status summary
          db.all(`
            SELECT status, COUNT(*) as count
            FROM risks
            GROUP BY status
          `, (err, results) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ success: false, error: 'Server Error' });
            }
            
            dashboardData.risksCount = results.reduce((sum, item) => sum + item.count, 0);
            
            // Create risk status summary
            results.forEach(item => {
              dashboardData.riskStatusSummary[item.status || 'Undefined'] = item.count;
            });
            
            // Get recent activity (last 10 updated items)
            db.all(`
              SELECT 
                'Strategic Goal' as type,
                goal_id as id,
                goal_description as description,
                progress,
                updated_at
              FROM strategic_goals
              UNION
              SELECT 
                'HR Initiative' as type,
                hr_initiative_id as id,
                initiative_name as description,
                progress,
                updated_at
              FROM hr_dev_initiatives
              UNION
              SELECT 
                'Digital Initiative' as type,
                digital_initiative_id as id,
                initiative_name as description,
                progress,
                updated_at
              FROM digital_initiatives
              UNION
              SELECT 
                'Action Item' as type,
                action_item_id as id,
                item_description as description,
                progress,
                updated_at
              FROM action_items
              ORDER BY updated_at DESC
              LIMIT 10
            `, (err, results) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, error: 'Server Error' });
              }
              
              dashboardData.recentActivity = results;
              
              // Return all dashboard data
              res.json({
                success: true,
                data: dashboardData
              });
            });
          });
        });
      });
    });
  });
};

// @desc    Get strategic goals KPI data
// @route   GET /api/dashboard/strategic-kpi
// @access  Private
const getStrategicKPI = (req, res) => {
  // Get strategic goals with target and actual values
  db.all(`
    SELECT
      sg.goal_id,
      sg.goal_description,
      sg.target_metric,
      sg.target_value,
      sg.actual_value,
      sg.progress,
      sp.plan_name as strategy_plan,
      sg.deadline
    FROM strategic_goals sg
    LEFT JOIN strategy_plans sp ON sg.strategy_plan_id = sp.strategy_plan_id
    ORDER BY sg.progress DESC
  `, (err, goals) => {
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

// @desc    Get action items KPI data
// @route   GET /api/dashboard/action-kpi
// @access  Private
const getActionKPI = (req, res) => {
  // Get action items with KPI data
  db.all(`
    SELECT
      ai.action_item_id,
      ai.item_description,
      ai.kpi,
      ai.kpi_target,
      ai.kpi_actual,
      ai.progress,
      ai.status,
      ap.plan_name as action_plan,
      ai.due_date,
      u.name as responsible_person,
      d.department_name
    FROM action_items ai
    LEFT JOIN action_plans ap ON ai.action_plan_id = ap.action_plan_id
    LEFT JOIN users u ON ai.responsible_person_id = u.id
    LEFT JOIN departments d ON ai.responsible_department_id = d.department_id
    ORDER BY ai.due_date ASC
  `, (err, actions) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: actions.length,
      data: actions
    });
  });
};

// @desc    Get risk summary data
// @route   GET /api/dashboard/risk-summary
// @access  Private
const getRiskSummary = (req, res) => {
  // Get risks with impact and likelihood
  db.all(`
    SELECT
      r.risk_id,
      r.risk_description,
      r.likelihood,
      r.impact,
      r.risk_score,
      r.status,
      u.name as responsible_person,
      rmp.plan_name as risk_plan,
      sp.plan_name as strategy_plan,
      ai.item_description as action_item
    FROM risks r
    LEFT JOIN users u ON r.responsible_person_id = u.id
    LEFT JOIN risk_management_plans rmp ON r.risk_plan_id = rmp.risk_plan_id
    LEFT JOIN strategy_plans sp ON r.strategy_plan_id = sp.strategy_plan_id
    LEFT JOIN action_items ai ON r.action_item_id = ai.action_item_id
    ORDER BY r.risk_score DESC
  `, (err, risks) => {
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

// @desc    Get timeline data
// @route   GET /api/dashboard/timeline
// @access  Private
const getTimeline = (req, res) => {
  // Get all items with due dates for timeline
  db.all(`
    SELECT
      'Strategic Goal' as type,
      goal_id as id,
      goal_description as description,
      deadline as due_date,
      progress
    FROM strategic_goals
    WHERE deadline IS NOT NULL
    UNION
    SELECT
      'Action Item' as type,
      action_item_id as id,
      item_description as description,
      due_date,
      progress
    FROM action_items
    WHERE due_date IS NOT NULL
    UNION
    SELECT
      'HR Initiative' as type,
      hr_initiative_id as id,
      initiative_name as description,
      null as due_date,
      progress
    FROM hr_dev_initiatives
    UNION
    SELECT
      'Digital Initiative' as type,
      digital_initiative_id as id,
      initiative_name as description,
      null as due_date,
      progress
    FROM digital_initiatives
    ORDER BY due_date ASC
  `, (err, timeline) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
    
    res.json({
      success: true,
      count: timeline.length,
      data: timeline
    });
  });
};

module.exports = {
  getOverview,
  getStrategicKPI,
  getActionKPI,
  getRiskSummary,
  getTimeline
};
