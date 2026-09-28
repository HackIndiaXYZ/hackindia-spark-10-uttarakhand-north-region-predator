const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    let { pickup, destination, date, time, passengers, bookingType, vehicleId, driverId, price } = req.body;

    if (!pickup || !destination || !date || !time || !passengers || !bookingType) {
      return res.status(400).json({ message: 'Please provide all required booking fields' });
    }

    // AI Pricing Engine for standard rides if price isn't set
    if (!price && bookingType !== 'PACKAGE') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
        const prompt = `Calculate a realistic and fair taxi fare in Indian Rupees (INR) for a trip from ${pickup} to ${destination} in Uttarakhand, India for ${passengers} passengers. Consider the hilly terrain, distance, and local rates (usually ₹15-20 per km). Respond ONLY with a pure integer number representing the total price. No symbols, no text. Just the number. If you don't know, estimate based on average 3 hour hill journey (e.g. 2500).`;
        const result = await model.generateContent(prompt);
        const generatedPrice = parseInt(result.response.text().replace(/\D/g, ''));
        if (!isNaN(generatedPrice) && generatedPrice > 0) {
          price = generatedPrice;
        } else {
          price = passengers * 500; // Fallback
        }
      } catch (aiError) {
        console.error('AI Pricing Error:', aiError);
        price = passengers * 500; // Fallback
      }
    }

    const newBooking = await db.query(
      `INSERT INTO bookings (customer_id, driver_id, vehicle_id, pickup, destination, date, time, passengers, booking_type, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING') RETURNING *`,
      [customerId, driverId || null, vehicleId || null, pickup, destination, date, time, passengers, bookingType, price || null]
    );

    res.status(201).json({ message: 'Booking request created successfully', booking: newBooking.rows[0] });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
    const bookings = await db.query(
      `SELECT b.*, u.name AS driver_name, u.phone AS driver_phone, v.model AS vehicle_model, v.vehicle_number
       FROM bookings b
       LEFT JOIN users u ON b.driver_id = u.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.customer_id = $1
       ORDER BY b.created_at DESC`,
      [customerId]
    );
    res.status(200).json({ bookings: bookings.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

const getDriverBookings = async (req, res) => {
  try {
    const driverId = req.user.id;
    const bookings = await db.query(
      `SELECT b.*, u.name AS customer_name, u.phone AS customer_phone
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       WHERE b.driver_id = $1 OR (b.status = 'PENDING' AND b.driver_id IS NULL)
       ORDER BY b.created_at DESC`,
      [driverId]
    );
    res.status(200).json({ bookings: bookings.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching driver bookings' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // EXTRACT RATING AND REVIEW FOR PACKAGES
    const { status, rating, review } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const bookingResult = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingResult.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
    const booking = bookingResult.rows[0];

    // --- CUSTOMER REVIEW OVERRIDE ---
    if (userRole === 'CUSTOMER' && rating && review) {
      if (booking.customer_id !== userId) return res.status(403).json({ message: 'Unauthorized' });
      const updated = await db.query('UPDATE bookings SET rating = $1, review = $2 WHERE id = $3 RETURNING *', [rating, review, bookingId]);
      return res.status(200).json({ message: 'Review submitted successfully', booking: updated.rows[0] });
    }

    const allowedStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'DRIVER ARRIVING', 'TRIP STARTED', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: `Invalid status: ${status}` });

    if (userRole === 'CUSTOMER') {
      if (booking.customer_id !== userId) return res.status(403).json({ message: 'Unauthorized' });
      if (status !== 'CANCELLED') return res.status(400).json({ message: 'Customers can only cancel bookings' });
      const updated = await db.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, bookingId]);
      return res.status(200).json({ message: 'Booking cancelled', booking: updated.rows[0] });
    }

    if (userRole === 'DRIVER') {
      if (status === 'CONFIRMED' && booking.driver_id === null) {
        const updated = await db.query('UPDATE bookings SET status = $1, driver_id = $2 WHERE id = $3 RETURNING *', [status, userId, bookingId]);
        return res.status(200).json({ message: 'Ride accepted', booking: updated.rows[0] });
      }
      if (status === 'REJECTED' && booking.driver_id === null) {
        const updated = await db.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, bookingId]);
        return res.status(200).json({ message: 'Ride rejected', booking: updated.rows[0] });
      }
      if (booking.driver_id !== userId) return res.status(403).json({ message: 'Unauthorized' });
      const updated = await db.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, bookingId]);
      return res.status(200).json({ message: `Status updated to ${status}`, booking: updated.rows[0] });
    }

    const updated = await db.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, bookingId]);
    res.status(200).json({ message: `Status updated`, booking: updated.rows[0] });

  } catch (error) {
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

module.exports = { createBooking, getMyBookings, getDriverBookings, updateBookingStatus };