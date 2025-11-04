// spot-sort-backend/routes/auth.js
const express = require('express');
const router = express.Router();
const {
  requestOtp,
  verifyOtp,
  login,
  getAllUsers,     // NEW
  deleteUser,      // NEW
  updateUserRole,  // NEW
} = require('../controllers/authController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');


// --- Public Auth Routes ---

// @desc    Request OTP for new user signup
// @route   POST /api/auth/request-otp
// @access  Public
router.post('/request-otp', requestOtp);

// @desc    Verify OTP and create new user
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', verifyOtp);

// @desc    Login user (Citizen, Authority, or Admin)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);


// --- Admin-Only User Management Routes ---

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), getAllUsers);

// @desc    Delete a user by ID
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// @desc    Update a user's role or zone
// @route   PUT /api/auth/users/:id/role
// @access  Private (Admin)
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);


module.exports = router;