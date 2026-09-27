const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

// Post a new package (Driver)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, duration, price, description, route } = req.body;
    const result = await db.query(
      `INSERT INTO tourism_packages (driver_id, title, duration, price, description, route) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, title, duration, Number(price), description, route]
    );
    res.status(201).json({ success: true, package: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create package' });
  }
});

// Get all packages (Customer)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.name AS driver_name, u.phone AS driver_phone 
      FROM tourism_packages p 
      JOIN users u ON p.driver_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch packages' });
  }
});

// NEW: Delete/Unpublish a package (Driver)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const pkgId = req.params.id;
    const driverId = req.user.id;
    
    // Ensure the driver deleting it is the owner
    const result = await db.query(
      'DELETE FROM tourism_packages WHERE id = $1 AND driver_id = $2 RETURNING *',
      [pkgId, driverId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or package not found' });
    }

    res.status(200).json({ message: 'Package unpublished successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unpublish package' });
  }
});

module.exports = router;