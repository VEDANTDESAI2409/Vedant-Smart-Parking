const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Parking System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/parkingslots', require('./routes/slots')); // alias for backward compatibility
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));
// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Smart Parking System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      parkingSlots: '/api/parkingslots',
      bookings: '/api/bookings',
      vehicles: '/api/vehicles',
      payments: '/api/payments',
      reports: '/api/reports',
      health: '/health'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚗 Smart Parking System API Server
📍 Running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health
📚 API Documentation: http://localhost:${PORT}/
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

module.exports = app;