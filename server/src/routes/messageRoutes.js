const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

// Get messages for a booking
router.get('/:bookingId', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, u.name as sender_name 
       FROM messages m JOIN users u ON m.sender_id = u.id 
       WHERE m.booking_id = $1 ORDER BY m.created_at ASC`,
      [req.params.bookingId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Send a message
router.post('/:bookingId', requireAuth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const result = await db.query(
      `INSERT INTO messages (booking_id, sender_id, receiver_id, content) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.bookingId, req.user.id, receiverId, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Mark messages as read
router.patch('/:bookingId/read', requireAuth, async (req, res) => {
  try {
    await db.query(
      `UPDATE messages SET is_read = true 
       WHERE booking_id = $1 AND receiver_id = $2 AND is_read = false`,
      [req.params.bookingId, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;