const express = require('express');
const router = express.Router();
const { 
  getActionPlans, 
  getActionPlan, 
  createActionPlan, 
  updateActionPlan, 
  deleteActionPlan 
} = require('../controllers/actionPlanController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getActionPlans)
  .post(protect, management, createActionPlan);

router.route('/:id')
  .get(protect, getActionPlan)
  .put(protect, management, updateActionPlan)
  .delete(protect, management, deleteActionPlan);

module.exports = router;