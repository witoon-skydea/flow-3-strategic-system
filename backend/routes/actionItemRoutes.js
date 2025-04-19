const express = require('express');
const router = express.Router();
const { 
  getActionItems, 
  getActionItem, 
  createActionItem, 
  updateActionItem, 
  deleteActionItem 
} = require('../controllers/actionItemController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getActionItems)
  .post(protect, management, createActionItem);

router.route('/:id')
  .get(protect, getActionItem)
  .put(protect, management, updateActionItem)
  .delete(protect, management, deleteActionItem);

module.exports = router;