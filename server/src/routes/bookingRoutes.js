const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getDriverBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/authMiddleware'); // requireRole removed for hackathon demo

// Customer endpoints
router.post('/', requireAuth, createBooking);
router.get('/my', requireAuth, getMyBookings);

// Driver endpoints (Role check bypassed so you can test in the same browser)
router.get('/driver-requests', requireAuth, getDriverBookings);

// Shared status update endpoint
router.patch('/:id/status', requireAuth, updateBookingStatus);
router.get('/admin/dashboard', requireAuth, async (req, res) => {
  const db = require('../config/db'); // Import DB connection
  
  try {
    // 1. Fetch All Bookings with Customer/Driver Names
    const bookingsData = await db.query(`
      SELECT b.*, 
             c.name AS customer_name, 
             d.name AS driver_name 
      FROM bookings b
      LEFT JOIN users c ON b.customer_id = c.id
      LEFT JOIN users d ON b.driver_id = d.id
      ORDER BY b.created_at DESC
    `);

    // 2. Fetch Users Data (Count Customers & Drivers)
    const usersData = await db.query("SELECT role, COUNT(*) FROM users GROUP BY role");
    let customerCount = 0;
    let driverCount = 0;
    usersData.rows.forEach(row => {
      if (row.role === 'CUSTOMER') customerCount = parseInt(row.count);
      if (row.role === 'DRIVER') driverCount = parseInt(row.count);
    });

    // 3. Fetch Pending Drivers (Drivers waiting for vehicle approval)
    // For the hackathon, we fetch all drivers to populate the pending list
    const pendingDrivers = await db.query("SELECT * FROM users WHERE role = 'DRIVER' ORDER BY created_at DESC LIMIT 10");

    // 4. Calculate Total Revenue from Completed Rides
    const completedRides = bookingsData.rows.filter(r => r.status === 'COMPLETED');
    const revenue = completedRides.reduce((sum, r) => sum + ((r.passengers || 1) * 250), 0);

    res.json({
      bookings: bookingsData.rows,
      pendingDrivers: pendingDrivers.rows,
      stats: {
        users: customerCount,
        drivers: driverCount,
        revenue: revenue
      }
    });

  } catch (error) {
    console.error('Admin Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching admin data' });
  }
});

module.exports = router;