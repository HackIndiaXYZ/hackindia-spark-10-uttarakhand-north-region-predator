const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
// @access  Private (Any logged-in user)
router.get('/profile', requireAuth, (req, res) => {
  res.status(200).json({ 
    message: 'Secure profile accessed', 
    user: req.user 
  });
});

// @route   GET /api/users/driver-only
// @access  Private (Only users with 'DRIVER' role)
router.get('/driver-only', requireAuth, requireRole(['DRIVER']), (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to the secure Driver Dashboard' 
  });
});

module.exports = router;