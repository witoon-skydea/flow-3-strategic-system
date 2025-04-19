const express = require('express');
const router = express.Router();
const { 
  getHrDevInitiatives, 
  getHrDevInitiative, 
  createHrDevInitiative, 
  updateHrDevInitiative, 
  deleteHrDevInitiative 
} = require('../controllers/hrDevInitiativeController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getHrDevInitiatives)
  .post(protect, management, createHrDevInitiative);

router.route('/:id')
  .get(protect, getHrDevInitiative)
  .put(protect, management, updateHrDevInitiative)
  .delete(protect, management, deleteHrDevInitiative);

module.exports = router;