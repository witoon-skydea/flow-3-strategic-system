const express = require('express');
const router = express.Router();
const {
  getStrategyPlans,
  getStrategyPlan,
  createStrategyPlan,
  updateStrategyPlan,
  deleteStrategyPlan
} = require('../controllers/strategyPlanController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getStrategyPlans)
  .post(protect, management, createStrategyPlan);

router.route('/:id')
  .get(protect, getStrategyPlan)
  .put(protect, management, updateStrategyPlan)
  .delete(protect, management, deleteStrategyPlan);

module.exports = router;
