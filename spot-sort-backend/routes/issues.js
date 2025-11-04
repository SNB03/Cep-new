// routes/issues.js
const express = require('express');
const router = express.Router();
const {
  createIssueAuth,
  createIssueOtpSend,
  createIssueAnonymous,
  getIssueByTicketId,
  verifyResolutionByEmail,
  getIssuesForCitizen,
  getIssuesForWork,
  updateIssueStatus,
  uploadResolution,
  citizenCloseIssue,
} = require('../controllers/issueController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- Public Routes ---

// @desc    Track a single issue by its Ticket ID
// @route   GET /api/issues/track/:ticketId
// @access  Public
router.get('/track/:ticketId', getIssueByTicketId);

// @desc    Anonymous citizen verifies/closes an issue
// @route   PUT /api/issues/:ticketId/verify
// @access  Public (verifies via email)
router.put('/:ticketId/verify', verifyResolutionByEmail);

// --- Anonymous Submission Flow ---

// @desc    Step 1: Anonymous user submits details to get OTP
// @route   POST /api/issues/otp-send
// @access  Public
router.post('/otp-send', createIssueOtpSend);

// @desc    Step 2: Anonymous user submits OTP and image to create issue
// @route   POST /api/issues/anonymous
// @access  Public
// Uses upload.single('issueImage') to match frontend FormData
router.post('/anonymous', upload.single('issueImage'), createIssueAnonymous);


// --- Authenticated Routes (All routes below require a valid token) ---

// @desc    Get all issues for the logged-in CITIZEN
// @route   GET /api/issues/my-reports
// @access  Private (Citizen)
router.get('/my-reports', protect, authorize('citizen'), getIssuesForCitizen);

// @desc    Get dashboard issues for AUTHORITY (by zone) or ADMIN (all)
// @route   GET /api/issues/authority/dashboard
// @access  Private (Authority, Admin)
router.get(
  '/authority/dashboard',
  protect,
  authorize('authority', 'admin'),
  getIssuesForWork
);

// @desc    Create a new issue (by logged-in user)
// @route   POST /api/issues
// @access  Private (Citizen)
// Uses protect middleware AND upload.single('issueImage')
router.post(
  '/',
  protect,
  authorize('citizen'),
  upload.single('issueImage'),
  createIssueAuth
);

// @desc    Authority uploads a resolution photo
// @route   PUT /api/issues/:ticketId/resolve
// @access  Private (Authority)
// Uses protect middleware AND upload.single('resolutionImage')
router.put(
  '/:ticketId/resolve',
  protect,
  authorize('authority'),
  upload.single('resolutionImage'),
  uploadResolution
);

// @desc    Admin/Authority updates status or reassigns zone
// @route   PUT /api/issues/:ticketId/status
// @access  Private (Authority, Admin)
router.put(
  '/:ticketId/status',
  protect,
  authorize('authority', 'admin'),
  updateIssueStatus
);

// @desc    Logged-in citizen confirms and closes an issue
// @route   PUT /api/issues/:ticketId/citizen-close
// @access  Private (Citizen)
router.put(
  '/:ticketId/citizen-close',
  protect,
  authorize('citizen'),
  citizenCloseIssue
);

module.exports = router;