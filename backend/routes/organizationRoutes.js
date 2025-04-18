const express = require('express');
const router = express.Router();
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = require('../controllers/organizationController');
const { protect, management } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOrganizations)
  .post(protect, management, createOrganization);

router.route('/:id')
  .get(protect, getOrganization)
  .put(protect, management, updateOrganization)
  .delete(protect, management, deleteOrganization);

module.exports = router;
