const express = require('express');
const router = express.Router();

// CRITICAL FIX: submitKYC is now imported here
const { register, login, updateSettings, getMe, submitKYC } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.patch('/settings', requireAuth, updateSettings);

// Secure KYC document route
router.post('/kyc', requireAuth, submitKYC);

module.exports = router;