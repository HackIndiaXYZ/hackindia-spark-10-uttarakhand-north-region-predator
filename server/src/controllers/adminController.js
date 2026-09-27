const db = require('../config/db');

// @route   GET /api/admin/dashboard
const getDashboardData = async (req, res) => {
  try {
    // 1. Pending Drivers for approval queue
    const driversRes = await db.query(
      `SELECT id, name, email, phone, vehicle_model, vehicle_number, aadhaar_number, license_number, verification_status 
       FROM users WHERE role = 'DRIVER' AND verification_status = 'PENDING'`
    );
    
    // 2. All Bookings
    const bookingsRes = await db.query(
      `SELECT b.*, c.name AS customer_name, d.name AS driver_name 
       FROM bookings b
       LEFT JOIN users c ON b.customer_id = c.id
       LEFT JOIN users d ON b.driver_id = d.id
       ORDER BY b.created_at DESC`
    );

    // 3. All Users
    const allUsersRes = await db.query(
      `SELECT id, name, email, phone, role, verification_status, created_at 
       FROM users ORDER BY id DESC`
    );

    // 4. All Vehicles (Smart Query with Driver Name)
    let vehicles = [];
    try {
      // First try to join a dedicated vehicles table if it has a driver_id
      const vRes = await db.query(`
        SELECT v.*, u.name AS driver_name 
        FROM vehicles v 
        LEFT JOIN users u ON v.driver_id = u.id 
        ORDER BY v.id DESC
      `);
      vehicles = vRes.rows;
    } catch (e) {
      console.log("Dedicated vehicles join failed, pulling dynamically from users table...");
    }

    // Fallback: If vehicles is empty or join failed, generate the list dynamically 
    // from drivers who have updated their vehicle settings in the app.
    if (vehicles.length === 0) {
      const fallbackRes = await db.query(`
        SELECT id, name AS driver_name, vehicle_model AS model, vehicle_number, 'Standard (4 pax)' AS capacity 
        FROM users 
        WHERE role = 'DRIVER' AND vehicle_number IS NOT NULL AND vehicle_number != ''
        ORDER BY id DESC
      `);
      vehicles = fallbackRes.rows;
    }

    // 5. Dashboard Stats (ZERO-COMMISSION SAAS MODEL)
    const usersRes = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'`);
    const activeDriversRes = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'DRIVER' AND verification_status = 'APPROVED'`);
    
    const activeDriversCount = parseInt(activeDriversRes.rows[0].count, 10);
    const monthlySaasFee = 399; 
    const projectedRevenue = activeDriversCount * monthlySaasFee;
    
    const stats = {
      users: parseInt(usersRes.rows[0].count, 10),
      drivers: activeDriversCount,
      revenue: projectedRevenue
    };

    res.status(200).json({ 
      pendingDrivers: driversRes.rows, 
      bookings: bookingsRes.rows, 
      allUsers: allUsersRes.rows,
      vehicles: vehicles,
      stats 
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to fetch admin data' });
  }
};

// @route   PATCH /api/admin/drivers/:id/status
const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const result = await db.query(
      `UPDATE users SET verification_status = $1 WHERE id = $2 AND role = 'DRIVER' RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.status(200).json({ message: `Driver successfully ${status.toLowerCase()}`, driver: result.rows[0] });
  } catch (error) {
    console.error('Update Driver Status Error:', error);
    res.status(500).json({ message: 'Failed to update driver status' });
  }
};

module.exports = { getDashboardData, updateDriverStatus };