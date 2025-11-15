// Backend Server - Production Ready - backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { tabMaster } = require('./tabMaster');
const { Execution, TabSession } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow frontend from any domain in production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root route for deployment verification
app.get('/', (req, res) => {
  res.json({ 
    message: 'TabMaster API is running!',
    status: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Execute commands and save to database
app.post('/api/execute', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { commands } = req.body;
    
    if (!commands || !Array.isArray(commands)) {
      return res.status(400).json({ error: 'Commands must be an array' });
    }

    const results = tabMaster(commands);
    const executionTime = Date.now() - startTime;

    const execution = new Execution({
      commands,
      results,
      executionTime,
      commandCount: commands.length
    });

    await execution.save();

    res.json({ 
      results, 
      executionTime,
      executionId: execution._id,
      savedToDb: true 
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get execution history
app.get('/api/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const executions = await Execution.find()
      .sort({ executedAt: -1 })
      .limit(limit)
      .select('commands results executedAt executionTime commandCount');

    res.json({ 
      history: executions,
      count: executions.length 
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific execution by ID
app.get('/api/execution/:id', async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json({ execution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete execution history
app.delete('/api/history/:id', async (req, res) => {
  try {
    await Execution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Execution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalExecutions = await Execution.countDocuments();
    const avgExecutionTime = await Execution.aggregate([
      { $group: { _id: null, avgTime: { $avg: '$executionTime' } } }
    ]);
    const totalCommands = await Execution.aggregate([
      { $group: { _id: null, total: { $sum: '$commandCount' } } }
    ]);

    res.json({
      totalExecutions,
      averageExecutionTime: avgExecutionTime[0]?.avgTime.toFixed(2) || 0,
      totalCommands: totalCommands[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});