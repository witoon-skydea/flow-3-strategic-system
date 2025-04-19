const express = require('express');
const router = express.Router();
const { 
  getRisks, 
  getRisk, 
  createRisk, 
  updateRisk, 
  deleteRisk 
} = require('../controllers/riskController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRisks)
  .post(protect, management, createRisk);

router.route('/:id')
  .get(protect, getRisk)
  .put(protect, management, updateRisk)
  .delete(protect, management, deleteRisk);

module.exports = router;