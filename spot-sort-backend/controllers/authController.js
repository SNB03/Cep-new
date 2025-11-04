// controllers/authController.js
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');
const logAction = require('../utils/logger');

// Helper to generate a 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Helper to sign and send JWT token
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign(
    { id: user._id, role: user.role, zone: user.zone },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );

  res.status(statusCode).json({
    token,
    role: user.role, // Frontend expects this
  });
};

// @desc    Request OTP for new user signup
// @route   POST /api/auth/request-otp
exports.requestOtp = async (req, res) => {
  const { name, email, password, mobileNumber, gender, dateOfBirth, role } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists and is verified' });
    }
    
    // 2. If user exists but is not verified, delete them to restart
    if (user && !user.isVerified) {
      await User.deleteOne({ _id: user._id });
    }

    // 3. Create new (unverified) user
    user = await User.create({
      name, email, password, mobileNumber, gender, dateOfBirth, role,
      isVerified: false,
    });
    
    // 4. Generate and save OTP
    const otpCode = generateOTP();
    await Otp.create({ email, otp: otpCode });

    // 5. Send OTP email
    const message = `
      <h1>Welcome to Spot & Sort!</h1>
      <p>Your verification code is:</p>
      <h2 style="font-size: 2.5rem; letter-spacing: 0.5rem; color: #14B8A6;">${otpCode}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;

    // --- STUBBED FOR DEVELOPMENT ---
    console.log(`--- OTP FOR ${email}: ${otpCode} ---`);
    // --- UNCOMMENT FOR PRODUCTION ---
    await sendEmail({
      email: user.email,
      subject: 'Spot & Sort Email Verification',
      message,
    });
    
    res.status(201).json({ 
      message: `Verification code sent to ${email}. Check your inbox (and spam).` 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during OTP request' });
  }
};

// @desc    Verify OTP and create new user
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // 1. Find the user and the OTP
    const user = await User.findOne({ email, isVerified: false });
    const otpEntry = await Otp.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found or already verified.' });
    }
    if (!otpEntry) {
      return res.status(400).json({ message: 'OTP not found or has expired. Please sign up again.' });
    }

    // 2. Check if OTP matches
    const isMatch = await otpEntry.matchOtp(otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // 3. Success! Verify user and delete OTP
    user.isVerified = true;
    await user.save();
    await Otp.deleteOne({ _id: otpEntry._id });

    res.status(200).json({ message: 'Account successfully verified! You can now log in.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during OTP verification' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  if (password === 'test1234') {
    let mockUser = null;

    // Mock Admin
    if (email === 'admin@test.com' && role === 'admin') {
      console.log('--- MOCK ADMIN LOGIN ---');
      mockUser = {
        _id: 'mock-admin-id',
        role: 'admin',
        zone: null // Admins don't have a zone
      };
    }
    
    // Mock Authority
    if (email === 'authority@test.com' && role === 'authority') {
      console.log('--- MOCK AUTHORITY LOGIN ---');
      mockUser = {
        _id: 'mock-authority-id',
        role: 'authority',
        zone: 'Central Zone' // Assign a mock zone for testing
      };
    }

    if (mockUser) {
      // If a mock user was matched, send the token response and exit.
      return sendTokenResponse(mockUser, 200, res);
    }
  }
  // --- END MOCK LOGIN ---

  try {
    // 1. Find user by email and role
    const user = await User.findOne({ email, role }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // 2. Check if user is verified
    if (!user.isVerified) {
       return res.status(401).json({ message: 'Account not verified. Please check your email for an OTP or sign up again.' });
    }

    // 3. Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Send token
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// ===============================================
// === NEW USER MANAGEMENT CONTROLLER FUNCTIONS ===
// ===============================================

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users, but exclude their passwords from the response
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' });
    }

    await User.deleteOne({ _id: req.params.id });
    await logAction(
      req.user,
      'DELETE_USER',
      `Admin deleted user ${user.email} (ID: ${user._id})`,
      user._id
    );

    res.status(200).json({ message: 'User successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a user's role or zone
// @route   PUT /api/auth/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  const { role, zone } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Optional: Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot change their own role' });
    }

    // Update fields
    user.role = role || user.role;
    
    // If setting role to 'authority', a zone is required
    if (user.role === 'authority' && !zone) {
       return res.status(400).json({ message: 'A zone is required to make a user an authority.' });
    }
    
    // If changing to citizen, clear the zone
    user.zone = (user.role === 'authority') ? zone : null;

    const updatedUser = await user.save();
    if (oldRole !== updatedUser.role) {
      await logAction(
        req.user,
        'UPDATE_ROLE',
        `Admin changed ${user.email}'s role from '${oldRole}' to '${updatedUser.role}' (Zone: ${updatedUser.zone || 'N/A'})`,
        user._id
      );
    }
    // Send back user without password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};