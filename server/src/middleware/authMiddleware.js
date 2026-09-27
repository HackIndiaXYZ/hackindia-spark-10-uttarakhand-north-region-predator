const jwt = require('jsonwebtoken');

// 1. Checks if the user is logged in
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackathon_secret');
    
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// 2. Checks if the logged-in user has the correct role (e.g., DRIVER or ADMIN)
const requireRole = (roles) => {
  return (req, res, next) => {
    // If the user's role isn't in the allowed array, block them
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
    }
    next();
  };
};

// CRITICAL: Export both functions so userRoutes and authRoutes don't crash
module.exports = { requireAuth, requireRole };