const express = require('express');
const router = express.Router();
const { 
  getDigitalInitiatives, 
  getDigitalInitiative, 
  createDigitalInitiative, 
  updateDigitalInitiative, 
  deleteDigitalInitiative 
} = require('../controllers/digitalInitiativeController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDigitalInitiatives)
  .post(protect, management, createDigitalInitiative);

router.route('/:id')
  .get(protect, getDigitalInitiative)
  .put(protect, management, updateDigitalInitiative)
  .delete(protect, management, deleteDigitalInitiative);

module.exports = router;