require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json());

// In-memory storage (no database issues)
const polls = new Map();
let pollId = 1;

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MicroPolls API', status: 'running', storage: 'memory' });
});

app.post('/api/polls', (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== (process.env.ADMIN_KEY || 'admin123')) {
      return res.status(401).json({ error: 'Invalid admin key' });
    }

    const { question, options } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Question and 2+ options required' });
    }

    const id = (pollId++).toString();
    const poll = {
      _id: id,
      question: question.trim(),
      options: options.map(text => ({ text: text.trim(), votes: 0 })),
      createdAt: new Date()
    };

    polls.set(id, poll);
    res.json({ _id: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

app.get('/api/polls/:id', (req, res) => {
  const poll = polls.get(req.params.id);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  res.json(poll);
});

app.post('/api/polls/:id/vote', (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = polls.get(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    poll.options[optionIndex].votes += 1;
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MicroPolls server running on port ${PORT}`);
  console.log('✅ Using in-memory storage (no database issues)');
});