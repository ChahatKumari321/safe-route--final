const express = require('express');
const router  = express.Router();
const {
  getIncidents, getIncidentById,
  createIncident, updateIncident, deleteIncident,
  getCategories, getMyIncidents,
} = require('../controllers/incidentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/categories',        getCategories);
router.get('/',                  getIncidents);
router.get('/mine',              authenticateToken, getMyIncidents);
router.get('/:id',               getIncidentById);
router.post('/',                 authenticateToken, createIncident);
router.patch('/:id',             authenticateToken, updateIncident);
router.delete('/:id',            authenticateToken, deleteIncident);

module.exports = router;
