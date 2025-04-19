const express = require('express');
const router = express.Router();
const { 
  getDigitalDevPlans, 
  getDigitalDevPlan, 
  createDigitalDevPlan, 
  updateDigitalDevPlan, 
  deleteDigitalDevPlan 
} = require('../controllers/digitalDevPlanController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDigitalDevPlans)
  .post(protect, management, createDigitalDevPlan);

router.route('/:id')
  .get(protect, getDigitalDevPlan)
  .put(protect, management, updateDigitalDevPlan)
  .delete(protect, management, deleteDigitalDevPlan);

module.exports = router;