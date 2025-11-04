// models/Otp.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  // This will automatically delete the document after 10 minutes
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m',
  },
});

// Hash OTP before saving
OtpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  next();
});

// Method to compare entered OTP
OtpSchema.methods.matchOtp = async function (enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otp);
};

module.exports = mongoose.model('Otp', OtpSchema);