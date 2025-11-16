// MicroPolls Backend Server - backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Poll } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow frontend
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/micropolls';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MicroPolls API is running!',
    status: 'online'
  });
});

// Create poll (admin only)
app.post('/api/polls', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_KEY || 'admin123';
    
    console.log('Received admin key:', adminKey);
    console.log('Expected admin key:', expectedKey);
    
    if (!adminKey || adminKey !== expectedKey) {
      return res.status(401).json({ error: 'Invalid admin key' });
    }

    const { question, options } = req.body;
    
    if (!question || !options || !Array.isArray(options) || options.length < 2 || options.length > 6) {
      return res.status(400).json({ error: 'Question and 2-6 options required' });
    }

    const poll = new Poll({
      question,
      options: options.map(text => ({ text, votes: 0 }))
    });

    await poll.save();
    res.json({ _id: poll._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get poll by ID
app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on poll
app.post('/api/polls/:id/vote', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    if (typeof optionIndex !== 'number') {
      return res.status(400).json({ error: 'Option index required' });
    }

    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    poll.options[optionIndex].votes += 1;
    await poll.save();

    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MicroPolls Server running on port ${PORT}`);
  console.log('Admin key configured:', process.env.ADMIN_KEY || 'admin123');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
});