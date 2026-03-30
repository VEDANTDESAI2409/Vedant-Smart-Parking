const mongoose = require('mongoose');
const City = require('../models/City');
const Pincode = require('../models/Pincode');
const Area = require('../models/Area');
const Location = require('../models/Location');

const canRunWithoutDb = () =>
  process.env.NODE_ENV !== 'production' && process.env.ALLOW_SERVER_WITHOUT_DB === 'true';

const isAtlasUri = (uri = '') => uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net');

const logConnectionGuidance = (error, uri) => {
  if (!uri) {
    console.error('MongoDB connection skipped: MONGODB_URI is not set in server/.env');
    return;
  }

  if (isAtlasUri(uri)) {
    console.error('Atlas troubleshooting checklist:');
    console.error('1. In MongoDB Atlas, add your current public IP under Network Access, or use 0.0.0.0/0 for temporary development access.');
    console.error('2. Confirm the database user in the connection string still exists and the password is correct.');
    console.error('3. Make sure the cluster is not paused and is reachable from your current network.');
    console.error('4. If your password has special characters, URL-encode them in MONGODB_URI.');

    if (error?.name) {
      console.error(`MongoDB error type: ${error.name}`);
    }

    return;
  }

  console.error('Local MongoDB troubleshooting checklist:');
  console.error('1. Make sure the MongoDB service is running on the host/port used by MONGODB_URI.');
  console.error('2. If you expected Atlas, replace the local URI in server/.env with your Atlas connection string.');
};

const syncCoreIndexes = async () => {
  const models = [
    { name: 'City', model: City },
    { name: 'Pincode', model: Pincode },
    { name: 'Area', model: Area },
    { name: 'Location', model: Location },
  ];

  const results = await Promise.allSettled(
    models.map(async ({ name, model }) => {
      await model.syncIndexes();
      console.log(`${name} indexes synced`);
    })
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to sync ${models[index].name} indexes:`, result.reason.message);
    }
  });
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      // Additional options for better performance and reliability
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await syncCoreIndexes();

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    logConnectionGuidance(error, mongoUri);

    if (canRunWithoutDb()) {
      console.warn('Starting server without database connection because ALLOW_SERVER_WITHOUT_DB is enabled.');
      return null;
    }

    process.exit(1);
  }
};

// Health check function
const checkConnection = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Get connection stats
const getConnectionStats = () => {
  return {
    readyState: mongoose.connection.readyState,
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  };
};

module.exports = {
  connectDB,
  checkConnection,
  getConnectionStats
};
