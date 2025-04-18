const express = require('express');
const router = express.Router();
const {
  getOverview,
  getStrategicKPI,
  getActionKPI,
  getRiskSummary,
  getTimeline
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getOverview);
router.get('/strategic-kpi', protect, getStrategicKPI);
router.get('/action-kpi', protect, getActionKPI);
router.get('/risk-summary', protect, getRiskSummary);
router.get('/timeline', protect, getTimeline);

module.exports = router;
