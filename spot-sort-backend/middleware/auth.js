// spot-sort-backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes by verifying JWT.
 * Attaches user's ID, role, and zone (if authority) to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for 'Authorization' header and that it's a Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- [NEW FIX] CHECK FOR MOCK USERS ---
      // If the ID is one of our mock IDs,
      // build req.user directly from the token payload and skip the DB check.
      if (decoded.id === 'mock-admin-id' || decoded.id === 'mock-authority-id') {
        req.user = {
          _id: decoded.id,
          role: decoded.role,
          zone: decoded.zone,
        };
        return next(); // Skip database query
      }
      // --- END OF FIX ---

      // If it's a REAL user, find them in the database
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach the real user object to the request
      req.user = user;
      next();

    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to restrict access based on user role.
 * @param {...string} roles - A list of roles that are allowed.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };