const express = require('express');
const router = express.Router();
const { 
  getHrDevPlans, 
  getHrDevPlan, 
  createHrDevPlan, 
  updateHrDevPlan, 
  deleteHrDevPlan 
} = require('../controllers/hrDevPlanController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getHrDevPlans)
  .post(protect, management, createHrDevPlan);

router.route('/:id')
  .get(protect, getHrDevPlan)
  .put(protect, management, updateHrDevPlan)
  .delete(protect, management, deleteHrDevPlan);

module.exports = router;