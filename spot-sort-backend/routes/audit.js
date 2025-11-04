// spot-sort-backend/routes/audit.js
const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all audit logs
// @route   GET /api/audit/logs
// @access  Private (Admin)
router.get('/logs', protect, authorize('admin'), getAuditLogs);

module.exports = router;