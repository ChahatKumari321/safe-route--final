/**
 * Middleware: Requires that req.user has role 'admin'.
 * Must be used AFTER authenticateToken.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
  next();
};

module.exports = { requireAdmin };
