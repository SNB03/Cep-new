// spot-sort-backend/controllers/auditController.js
const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit/logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    // Get the latest 200 logs, sorted by newest first
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};