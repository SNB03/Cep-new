// controllers/issueController.js
const Issue = require('../models/Issue');
const TempIssue = require('../models/TempIssue');
const User = require('../models/User');
const crypto =require('crypto');
const sendEmail = require('../utils/emailService');
const logAction = require('../utils/logger');

// Helper to get file path
const getFilePath = (file) => {
  if (!file) return null;
  // We return the *URL path* that the server serves, not the filesystem path
  return `/uploads/${file.filename}`;
};

// Helper to generate a 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();


// --- ISSUE CREATION ---

// @desc    Create a new issue (by logged-in user)
// @route   POST /api/issues
exports.createIssueAuth = async (req, res) => {
  const { title, issueType, description, lat, lng, zone } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an issue image' });
  }

  try {
    const issue = await Issue.create({
      title,
      issueType,
      description,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      zone,
      issueImageUrl: getFilePath(req.file),
      reporter: req.user.id, // From 'protect' middleware
    });
    
    res.status(201).json({ ticketId: issue.ticketId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating issue' });
  }
};

// @desc    Step 1: Anonymous user submits details to get OTP
// @route   POST /api/issues/otp-send
exports.createIssueOtpSend = async (req, res) => {
  const { reporterName, reporterEmail, reporterMobile, title, zone, issueType, description, lat, lng } = req.body;

  try {
    // 1. Delete any previous temp issue from this email
    await TempIssue.deleteMany({ reporterEmail });

    // 2. Generate OTP and Temp ID
    const otpCode = generateOTP();
    const tempId = crypto.randomBytes(16).toString('hex');
    
    // 3. Create and save the temporary issue data (OTP is hashed by pre-save hook)
    await TempIssue.create({
      tempId,
      reporterName, reporterEmail, reporterMobile,
      title, issueType, description, lat, lng, zone,
      otp: otpCode,
    });
    
    // 4. Send OTP email
    const message = `
      <h1>Spot & Sort Anonymous Report Verification</h1>
      <p>Thank you for your report. Please use the code below to verify your email and submit your issue:</p>
      <h2 style="font-size: 2.5rem; letter-spacing: 0.5rem; color: #14B8A6;">${otpCode}</h2>
      <p>This code will expire in 15 minutes.</p>
    `;

    // --- STUBBED FOR DEVELOPMENT ---
    console.log(`--- ANON OTP FOR ${reporterEmail}: ${otpCode} ---`);
    // --- UNCOMMENT FOR PRODUCTION ---
    await sendEmail({
      email: reporterEmail,
      subject: 'Your Spot & Sort Report Verification Code',
      message,
    });
    
    res.status(201).json({ tempId: tempId });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error sending OTP' });
  }
};

// @desc    Step 2: Anonymous user submits OTP and image to create issue
// @route   POST /api/issues/anonymous
exports.createIssueAnonymous = async (req, res) => {
  const { enteredOtp, tempId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'Issue image is required' });
  }

  try {
    // 1. Find the temporary issue data
    const tempIssue = await TempIssue.findOne({ tempId });
    if (!tempIssue) {
      return res.status(404).json({ message: 'Report session expired. Please try again.' });
    }
    
    // 2. Verify the OTP
    const isMatch = await tempIssue.matchOtp(enteredOtp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // 3. Create the permanent issue
    const issue = await Issue.create({
      title: tempIssue.title,
      issueType: tempIssue.issueType,
      description: tempIssue.description,
      location: { lat: tempIssue.lat, lng: tempIssue.lng },
      zone: tempIssue.zone,
      issueImageUrl: getFilePath(req.file),
      anonymousReporter: {
        name: tempIssue.reporterName,
        email: tempIssue.reporterEmail,
        mobile: tempIssue.reporterMobile,
      },
    });

    // 4. Delete the temporary data
    await TempIssue.deleteOne({ _id: tempIssue._id });
    const message = `
      <h1>Your Report has been Submitted!</h1>
      <p>Thank you, ${tempIssue.reporterName}, for helping improve your community.</p>
      <p>Your Ticket ID is:</p>
      <h2 style="font-size: 2.5rem; letter-spacing: 0.5rem; color: #14B8A6;">${issue.ticketId}</h2>
      <p>You can use this ID to track the status of your report on our website.</p>
    `;
    
    // Send email (no need to await, let it send in the background)
    sendEmail({
      email: tempIssue.reporterEmail,
      subject: `Your Spot & Sort Ticket ID: ${issue.ticketId}`,
      message,
    }).catch(err => console.error("Failed to send ticket ID email:", err)); // Log error if email fails
    // --- [END NEW] ---
    // 5. Send success response
    res.status(201).json({ ticketId: issue.ticketId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating issue' });
  }
};


// --- ISSUE RETRIEVAL (GET) ---

// @desc    Track a single issue by its Ticket ID
// @route   GET /api/issues/track/:ticketId
exports.getIssueByTicketId = async (req, res) => {
  try {
    const issue = await Issue.findOne({ ticketId: req.params.ticketId });
    if (!issue) {
      return res.status(404).json({ message: 'Ticket ID not found' });
    }
    res.status(200).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all issues for the logged-in CITIZEN
// @route   GET /api/issues/my-reports
exports.getIssuesForCitizen = async (req, res) => {
  try {
    // Find issues where the reporter ID matches the logged-in user's ID
    const issues = await Issue.find({ reporter: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard issues for AUTHORITY (by zone) or ADMIN (all)
// @route   GET /api/issues/authority/dashboard
exports.getIssuesForWork = async (req, res) => {
  try {
    let query = {};
    
    // If user is ADMIN, query is empty (get all)
    // If user is AUTHORITY, filter by their assigned zone
    if (req.user.role === 'authority') {
      if (!req.user.zone) {
         return res.status(403).json({ message: 'Authority account not assigned to a zone.' });
      }
      query = { zone: req.user.zone };
    }
    
    const issues = await Issue.find(query).sort({ createdAt: -1 });
    res.status(200).json(issues);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// --- ISSUE UPDATES (PUT) ---

// @desc    Anonymous citizen verifies/closes an issue
// @route   PUT /api/issues/:ticketId/verify
exports.verifyResolutionByEmail = async (req, res) => {
  const { email } = req.body;
  const { ticketId } = req.params;
  
  try {
    const issue = await Issue.findOne({ ticketId });
    if (!issue) {
      return res.status(404).json({ message: 'Ticket ID not found' });
    }
    
    // Check if issue is ready for verification
    if (issue.status !== 'Awaiting Verification') {
      return res.status(400).json({ message: `Issue is currently ${issue.status}, not awaiting verification.` });
    }
    
    // Check if the provided email matches the anonymous reporter's email
    if (!issue.anonymousReporter || issue.anonymousReporter.email !== email) {
      return res.status(403).json({ message: 'Email does not match the original reporter.' });
    }
    
    // Success: Close the issue
    issue.status = 'Closed';
    await issue.save();
    await logAction(
      null, // Anonymous user
      'CITIZEN_VERIFY',
      `Anonymous user (email: ${email}) verified and closed issue ${issue.ticketId}`,
      issue.ticketId
    );
    res.status(200).json({ 
      message: 'Verification successful! The issue is now closed.',
      newStatus: 'Closed'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logged-in citizen confirms and closes an issue
// @route   PUT /api/issues/:ticketId/citizen-close
exports.citizenCloseIssue = async (req, res) => {
  try {
    const issue = await Issue.findOne({
      ticketId: req.params.ticketId,
      reporter: req.user.id, // Ensure issue belongs to this user
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found or you are not the reporter.' });
    }

    if (issue.status !== 'Awaiting Verification') {
      return res.status(400).json({ message: 'This issue is not awaiting your verification.' });
    }

    issue.status = 'Closed';
    await issue.save();
    await logAction(
      req.user,
      'CITIZEN_VERIFY',
      `Citizen ${req.user.email} verified and closed issue ${issue.ticketId}`,
      issue.ticketId
    );

    res.status(200).json({ message: 'Issue successfully closed.', newStatus: 'Closed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authority uploads a resolution photo
// @route   PUT /api/issues/:ticketId/resolve
exports.uploadResolution = async (req, res) => {
  const { status } = req.body; // Should be "Awaiting Verification"
  
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a resolution image' });
  }
  
  try {
    const issue = await Issue.findOne({ ticketId: req.params.ticketId });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // (Admin check not needed here, already authorized by route)
    // If authority, check if issue is in their zone
    if (req.user.role === 'authority' && issue.zone !== req.user.zone) {
       return res.status(403).json({ message: 'Not authorized for this issue zone.' });
    }
    
    // Update issue
    issue.status = status || 'Awaiting Verification';
    issue.resolutionImageUrl = getFilePath(req.file);
    await issue.save();
    await logAction(
      req.user,
      'UPLOAD_RESOLUTION',
      `Authority ${req.user.email} uploaded resolution for ${issue.ticketId} (Status: ${oldStatus} -> ${issue.status})`,
      issue.ticketId
    );
    res.status(200).json({ 
      message: 'Resolution image uploaded. Status set to Awaiting Verification.',
      newStatus: issue.status 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin/Authority updates status or reassigns zone
// @route   PUT /api/issues/:ticketId/status
exports.updateIssueStatus = async (req, res) => {
  const { status, zone } = req.body; // Frontend can send new status or zone
  
  try {
    const issue = await Issue.findOne({ ticketId: req.params.ticketId });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // If authority, check if issue is in their zone (unless admin)
    if (req.user.role === 'authority' && issue.zone !== req.user.zone) {
       return res.status(403).json({ message: 'Not authorized for this issue zone.' });
    }

    // Update fields if they were provided
    if (status) {
      issue.status = status;
    }
    if (zone && req.user.role === 'admin') { // Only admin can re-assign zone
      issue.zone = zone;
    }
    
    await issue.save();
    if (status && status !== oldStatus) {
      await logAction(
        req.user,
        'UPDATE_STATUS',
        `User ${req.user.email} set issue ${issue.ticketId} status from '${oldStatus}' to '${status}'`,
        issue.ticketId
      );
    }
    if (zone && zone !== oldZone && req.user.role === 'admin') {
      await logAction(
        req.user,
        'REASSIGN_ZONE',
        `Admin ${req.user.email} reassigned issue ${issue.ticketId} from zone '${oldZone}' to '${zone}'`,
        issue.ticketId
      );
    }
    res.status(200).json(issue);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};