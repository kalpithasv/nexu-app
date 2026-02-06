const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FitPulse API Server Running' });
});

// Routes (to be implemented)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/trainer', require('./routes/trainer'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FitPulse API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile devices can connect at http://192.168.29.100:${PORT}/api`);
});

module.exports = app;
