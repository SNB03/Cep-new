// spot-sort-backend/models/AuditLog.js
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // We log the email, not the ID, so it's readable
  // and persists even if the user is deleted.
  userEmail: {
    type: String,
    default: 'System', // For system actions or anonymous
  },
  action: {
    type: String,
    required: true, // e.g., 'UPDATE_ISSUE_STATUS', 'DELETE_USER'
    index: true,
  },
  details: {
    type: String, // e.g., "Admin set issue P-123456 to 'Closed'"
  },
  // The ID of the issue or user that was affected
  targetId: {
    type: String, 
    index: true,
  },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);