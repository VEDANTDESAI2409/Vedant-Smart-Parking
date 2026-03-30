const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, checkConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const defaultClientUrls =
  'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001';

const allowedOrigins = (process.env.CLIENT_URL || defaultClientUrls)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalDevOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
    environment: process.env.NODE_ENV || 'development',
    databaseConnected: checkConnection()
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/parkingslots', require('./routes/slots')); // alias for backward compatibility
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/user/bookings', require('./routes/bookings'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/cities', require('./routes/cities'));
app.use('/api/pincodes', require('./routes/pincodes'));
app.use('/api/areas', require('./routes/areas'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/imports', require('./routes/imports'));

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
      cities: '/api/cities',
      pincodes: '/api/pincodes',
      areas: '/api/areas',
      locations: '/api/locations',
      imports: '/api/imports/:type',
      health: '/health'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`
Smart Parking System API Server
Running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Health check: http://localhost:${PORT}/health
API Documentation: http://localhost:${PORT}/
    `);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
    return;
  }

  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

module.exports = app;
