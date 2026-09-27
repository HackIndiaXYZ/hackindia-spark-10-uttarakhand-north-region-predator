const express = require('express');
const router = express.Router();

// FIX: Importing the correct middleware name used in your project
const { requireAuth } = require('../middleware/authMiddleware'); 

const { createPool, getActivePools, getMyActivePool, joinPool, endPool } = require('../controllers/poolController');

// Pool Routes
router.get('/', getActivePools);
router.post('/', requireAuth, createPool);
router.get('/my-active', requireAuth, getMyActivePool);
router.post('/:id/join', requireAuth, joinPool);
router.patch('/:id/end', requireAuth, endPool);

module.exports = router;