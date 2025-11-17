// MongoDB Models - backend/models.js

const mongoose = require('mongoose');

// Schema for storing polls
const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
PollSchema.index({ _id: 1 }); // Primary key index (usually automatic but explicit)
PollSchema.index({ createdAt: -1 }); // For sorting by creation date

const Poll = mongoose.model('Poll', PollSchema);

module.exports = { Poll };