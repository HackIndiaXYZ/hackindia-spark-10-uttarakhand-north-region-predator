const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Connected to Neon PostgreSQL at:', res.rows[0].now);
  }
});

// THIS EXPORT IS REQUIRED FOR authController to use db.query()
module.exports = {
  query: (text, params) => pool.query(text, params),
};