// models/TempIssue.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const TempIssueSchema = new mongoose.Schema({
  // This is the tempId sent back to the frontend
  tempId: {
    type: String,
    required: true,
    unique: true,
  },
  // Reporter details
  reporterName: String,
  reporterEmail: String,
  reporterMobile: String,
  // Issue details
  title: String,
  issueType: String,
  description: String,
  lat: Number,
  lng: Number,
  zone: String,
  // OTP for this specific submission
  otp: String,
  // Automatically delete after 15 minutes
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '15m',
  },
});

// Hash OTP before saving
TempIssueSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) {
    return next();
  }
  const salt = await require('bcryptjs').genSalt(10);
  this.otp = await require('bcryptjs').hash(this.otp, salt);
  next();
});

// Method to compare entered OTP
TempIssueSchema.methods.matchOtp = async function (enteredOtp) {
  return await require('bcryptjs').compare(enteredOtp, this.otp);
};

module.exports = mongoose.model('TempIssue', TempIssueSchema);