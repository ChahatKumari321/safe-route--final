const express = require('express');
const router  = express.Router();
const { calculateRoute } = require('../controllers/routeController');
const { authenticateToken } = require('../middleware/auth');

// Route calculation - auth optional (saves route if logged in)
router.post('/calculate', (req, res, next) => {
  // Try to authenticate but don't block if no token
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, calculateRoute);

module.exports = router;
