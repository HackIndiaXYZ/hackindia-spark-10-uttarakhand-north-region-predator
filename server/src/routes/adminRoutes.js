const express = require('express');
const router = express.Router();
const { getDashboardData, updateDriverStatus } = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');

// Custom Inline Middleware: Double-check Admin Role
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }
};

// Admin Routes
router.get('/dashboard', requireAuth, requireAdmin, getDashboardData);
router.patch('/drivers/:id/status', requireAuth, requireAdmin, updateDriverStatus);

module.exports = router;