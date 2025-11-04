// spot-sort-backend/utils/logger.js
const AuditLog = require('../models/AuditLog');

/**
 * Creates an audit log entry.
 * @param {object} user - The user object from req.user (can be null).
 * @param {string} action - A short code for the action (e.g., 'DELETE_USER').
 * @param {string} details - A human-readable description of what happened.
 * @param {string} targetId - The _id or ticketId of the item that was changed.
 */
const logAction = async (user, action, details, targetId) => {
  try {
    let userEmail = 'System/Anonymous';
    if (user && user.email) {
      userEmail = user.email;
    } else if (user && user.role) {
      // For mock users who might not have an email
      userEmail = `Mock ${user.role}`;
    }

    await AuditLog.create({
      userEmail,
      action,
      details,
      targetId: targetId || null,
    });
  } catch (error) {
    // Log to console, but don't stop the main function
    console.error('Failed to write to audit log:', error);
  }
};

module.exports = logAction;