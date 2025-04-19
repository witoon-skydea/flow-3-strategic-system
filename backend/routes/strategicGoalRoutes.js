const express = require('express');
const router = express.Router();
const { 
  getStrategicGoals, 
  getStrategicGoal, 
  createStrategicGoal, 
  updateStrategicGoal, 
  deleteStrategicGoal 
} = require('../controllers/strategicGoalController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getStrategicGoals)
  .post(protect, management, createStrategicGoal);

router.route('/:id')
  .get(protect, getStrategicGoal)
  .put(protect, management, updateStrategicGoal)
  .delete(protect, management, deleteStrategicGoal);

module.exports = router;