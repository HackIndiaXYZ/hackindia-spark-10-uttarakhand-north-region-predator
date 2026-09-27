const express = require('express');
const cors = require('cors');
const http = require('http'); // NEW: Required to bind Socket.io
const { Server } = require('socket.io'); // NEW: The WebSocket server
require('dotenv').config();

// UPDATED: Initialize and assign the database to 'db' so the chat routes can query it
const db = require('./src/config/db');

const app = express();

// NEW: Wrap the Express app in a standard Node HTTP server for WebSockets
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/pools', require('./src/routes/poolRoutes')); 
app.use('/api/packages', require('./src/routes/packageRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));

// Root Route
app.get('/', (req, res) => {
  res.send('PahadiRide API is live');
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Backend is running!' });
});

// --- CHAT SYSTEM IMPLEMENTATION ---

// REST endpoint to fetch chat history when a user opens the chat widget
app.get('/api/chat/:bookingId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM messages WHERE booking_id = $1 ORDER BY created_at ASC', 
      [req.params.bookingId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// Real-time WebSocket event listeners
io.on('connection', (socket) => {
  // 1. Assign the user to a private "room" specific to their booking ID
  socket.on('join_ride', (bookingId) => {
    socket.join(`ride_${bookingId}`);
  });

  // 2. Listen for incoming messages, save to Neon Postgres, and broadcast to the room
  socket.on('send_message', async (data) => {
    const { bookingId, senderId, message } = data;
    try {
      // 1. Check if the ride is still in a chat-eligible status
      const rideCheck = await db.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
      const currentStatus = rideCheck.rows[0]?.status;
      
      if (['TRIP STARTED', 'COMPLETED', 'CANCELLED'].includes(currentStatus)) {
        return; // Silently drop the message, the chat is officially dead
      }

      // 2. If valid, save and broadcast
      const result = await db.query(
        'INSERT INTO messages (booking_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *',
        [bookingId, senderId, message]
      );
      io.to(`ride_${bookingId}`).emit('receive_message', result.rows[0]);
    } catch (err) {
      console.error('Chat error:', err);
    }
  });
});

const PORT = process.env.PORT || 5000;
// CRITICAL: Use server.listen() instead of app.listen() to initialize WebSockets
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const cron = require('node-cron');

// Runs every night at midnight to delete old chats
cron.schedule('0 0 * * *', async () => {
  try {
    await db.query(`
      DELETE FROM messages m
      USING bookings b
      WHERE m.booking_id = b.id 
      AND b.status IN ('COMPLETED', 'CANCELLED')
      AND m.created_at < NOW() - INTERVAL '5 days'
    `);
    console.log('✅ Auto-purged chats older than 5 days post-trip');
  } catch (err) { console.error('Chat purge failed', err); }
});