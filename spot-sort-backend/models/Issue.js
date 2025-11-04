// models/Issue.js
const mongoose = require('mongoose');

// Helper function to generate a ticket ID
const generateTicketId = async (issueType) => {
  const prefix = issueType.charAt(0).toUpperCase(); // 'P' or 'W'
  const count = await mongoose.model('Issue').countDocuments({ issueType });
  return `${prefix}-${(count + 1).toString().padStart(6, '0')}`;
};

const IssueSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    issueType: {
      type: String,
      required: [true, 'Please select an issue type'],
      enum: ['pothole', 'waste'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    location: {
      lat: Number,
      lng: Number,
    },
    // The 'zone' is crucial for assigning to authorities
    zone: {
      type: String,
      required: [true, 'Please add a zone/locality'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Awaiting Verification', 'Closed'],
      default: 'Pending',
    },
    // --- Reporter Info ---
    // For logged-in users
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    // For anonymous users (we store their details directly)
    anonymousReporter: {
      name: String,
      email: String,
      mobile: String,
    },
    // --- Image URLs ---
    // Path to the image file, relative to the server
    issueImageUrl: {
      type: String,
      required: [true, 'Please upload an issue image'],
    },
    // Path to the proof of resolution, uploaded by authority
    resolutionImageUrl: {
      type: String,
    },
    // --- Timestamps ---
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// --- Mongoose Middleware ---

// Before saving a new issue, generate its ticketId
IssueSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.ticketId = await generateTicketId(this.issueType);
  }
  next();
});

module.exports = mongoose.model('Issue', IssueSchema);