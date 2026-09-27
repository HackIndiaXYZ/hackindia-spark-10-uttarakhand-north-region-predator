const db = require('../config/db');

// @route   POST /api/pools
exports.createPool = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { boardingPoint, destination, departTime, price, seats } = req.body;

    // Deactivate any previous active pool for this driver
    await db.query(`UPDATE pools SET status = 'CANCELLED' WHERE driver_id = $1 AND status = 'ACTIVE'`, [driverId]);

    const result = await db.query(
      `INSERT INTO pools (driver_id, boarding_point, destination, depart_time, price, total_seats, seats_left, seats_booked, status)
       VALUES ($1, $2, $3, $4, $5, $6, $6, 0, 'ACTIVE')
       RETURNING *`,
      [driverId, boardingPoint, destination, departTime, Number(price), Number(seats)]
    );

    res.status(201).json({ success: true, pool: result.rows[0] });
  } catch (error) {
    console.error('Create pool error:', error);
    res.status(500).json({ message: 'Failed to broadcast pool' });
  }
};

// @route   GET /api/pools
exports.getActivePools = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id, 
        p.driver_id, 
        p.boarding_point, 
        p.destination, 
        p.depart_time, 
        p.price, 
        p.total_seats, 
        p.seats_left, 
        p.seats_booked,
        u.name AS driver_name,
        u.phone AS driver_phone,
        u.vehicle_model,
        u.vehicle_number
      FROM pools p
      JOIN users u ON p.driver_id = u.id
      WHERE p.status = 'ACTIVE' AND p.seats_left > 0
      ORDER BY p.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch active pools error:', error);
    res.status(500).json({ message: 'Failed to fetch pools' });
  }
};

// @route   GET /api/pools/my-active
exports.getMyActivePool = async (req, res) => {
  try {
    const driverId = req.user.id;
    const result = await db.query(
      `SELECT * FROM pools WHERE driver_id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [driverId]
    );

    res.status(200).json({ pool: result.rows[0] || null });
  } catch (error) {
    console.error('Fetch my active pool error:', error);
    res.status(500).json({ message: 'Failed to check driver pool' });
  }
};

// @route   POST /api/pools/:id/join
exports.joinPool = async (req, res) => {
  try {
    const poolId = req.params.id;
    const customerId = req.user.id;
    const requestedSeats = req.body.seats ? Number(req.body.seats) : 1;

    // Check pool availability
    const poolRes = await db.query(`SELECT * FROM pools WHERE id = $1 AND status = 'ACTIVE'`, [poolId]);
    if (poolRes.rows.length === 0) {
      return res.status(404).json({ message: 'Pool not found or no longer active' });
    }

    const pool = poolRes.rows[0];
    if (pool.seats_left < requestedSeats) {
      return res.status(400).json({ message: `Only ${pool.seats_left} seats left in this vehicle` });
    }

    // Decrement seats_left & increment seats_booked
    const updatedPool = await db.query(
      `UPDATE pools 
       SET seats_left = seats_left - $2, seats_booked = seats_booked + $2 
       WHERE id = $1 RETURNING *`,
      [poolId, requestedSeats]
    );

    // FIX: Removed 'price' from this insert to prevent SQL crashes
    const today = new Date().toISOString().split('T')[0];
    await db.query(
      `INSERT INTO bookings (customer_id, driver_id, pickup, destination, date, time, passengers, booking_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'SHARED', 'CONFIRMED')`,
      [customerId, pool.driver_id, pool.boarding_point, pool.destination, today, pool.depart_time, requestedSeats]
    );

    res.status(200).json({ success: true, pool: updatedPool.rows[0] });
  } catch (error) {
    console.error('Join pool error:', error);
    res.status(500).json({ message: 'Failed to reserve seat' });
  }
};

// @route   PATCH /api/pools/:id/end
exports.endPool = async (req, res) => {
  try {
    const poolId = req.params.id;
    const driverId = req.user.id;

    await db.query(`UPDATE pools SET status = 'COMPLETED' WHERE id = $1 AND driver_id = $2`, [poolId, driverId]);
    res.status(200).json({ success: true, message: 'Broadcast ended' });
  } catch (error) {
    console.error('End pool error:', error);
    res.status(500).json({ message: 'Failed to end broadcast' });
  }
};