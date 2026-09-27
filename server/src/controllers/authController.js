const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const submitKYC = async (req, res) => {
  try {
    const { aadhaar, license } = req.body;
    const result = await db.query(
      `UPDATE users 
       SET aadhaar_number = $1, license_number = $2, verification_status = 'PENDING' 
       WHERE id = $3 RETURNING *`,
      [aadhaar, license, req.user.id]
    );
    res.status(200).json({ message: 'Documents submitted successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting documents' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = (role || 'CUSTOMER').toUpperCase(); 

    // FIX: Auto-approve drivers for the hackathon and insert into password_hash
    const result = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role, verification_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, phone, verification_status',
      [name, email, phone, hashedPassword, userRole, 'APPROVED']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'hackathon_secret', { expiresIn: '7d' });
    
    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // FIX: Checking password_hash
    if (!user.password_hash) {
      return res.status(401).json({ message: 'Account invalid. Please re-register.' });
    }

    // FIX: Comparing against password_hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'hackathon_secret', { expiresIn: '7d' });
    
    res.status(200).json({ token, user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, vehicle_model, vehicle_number, daily_goal } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           phone = COALESCE($2, phone), 
           vehicle_model = COALESCE($3, vehicle_model), 
           vehicle_number = COALESCE($4, vehicle_number),
           daily_goal = COALESCE($5, daily_goal)
       WHERE id = $6 RETURNING id, name, email, phone, role, vehicle_model, vehicle_number, daily_goal`,
      [name, phone, vehicle_model, vehicle_number, daily_goal, userId]
    );

    res.status(200).json({ message: 'Settings updated', user: result.rows[0] });
  } catch (error) {
    console.error('Settings Update Error:', error);
    res.status(500).json({ message: 'Failed to save settings' });
  }
};

const getMe = async (req, res) => {
  try {
    // FIXED: Selecting ALL columns so the frontend knows if you are 'APPROVED'
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove the password hash before sending the profile to the frontend for security
    const user = result.rows[0];
    delete user.password_hash;
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

module.exports = { register, login, updateSettings, getMe, submitKYC };