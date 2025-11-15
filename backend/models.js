// MongoDB Models - backend/models.js

const mongoose = require('mongoose');

// Schema for storing command execution history
const ExecutionSchema = new mongoose.Schema({
  commands: [{
    type: String,
    required: true
  }],
  results: [{
    type: String
  }],
  executedAt: {
    type: Date,
    default: Date.now
  },
  executionTime: {
    type: Number, // milliseconds
    required: true
  },
  commandCount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Schema for storing individual tab sessions
const TabSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  tabs: [{
    tabId: Number,
    currentURL: String,
    backStack: [String],
    forwardStack: [String]
  }],
  downloadQueue: [String],
  activeTabId: Number,
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ExecutionSchema.index({ executedAt: -1 });
TabSessionSchema.index({ sessionId: 1, lastActivity: -1 });

const Execution = mongoose.model('Execution', ExecutionSchema);
const TabSession = mongoose.model('TabSession', TabSessionSchema);

module.exports = { Execution, TabSession };