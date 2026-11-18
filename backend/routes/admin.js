const express = require('express');
const router  = express.Router();
const { getStats, adminGetIncidents, updateIncidentStatus, adminDeleteIncident } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin }      = require('../middleware/adminAuth');

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

router.get('/stats',                   getStats);
router.get('/incidents',               adminGetIncidents);
router.patch('/incidents/:id/status',  updateIncidentStatus);
router.delete('/incidents/:id',        adminDeleteIncident);

module.exports = router;
