const express = require('express');
const router = express.Router();
const { 
  getRiskManagementPlans, 
  getRiskManagementPlan, 
  createRiskManagementPlan, 
  updateRiskManagementPlan, 
  deleteRiskManagementPlan 
} = require('../controllers/riskManagementPlanController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRiskManagementPlans)
  .post(protect, management, createRiskManagementPlan);

router.route('/:id')
  .get(protect, getRiskManagementPlan)
  .put(protect, management, updateRiskManagementPlan)
  .delete(protect, management, deleteRiskManagementPlan);

module.exports = router;