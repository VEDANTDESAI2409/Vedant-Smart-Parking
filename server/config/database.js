const mongoose = require('mongoose');

const isEnabled = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const allowServerWithoutDB = isEnabled(process.env.ALLOW_SERVER_WITHOUT_DB);
  const connectOnStart = !['0', 'false', 'no', 'off'].includes(String(process.env.MONGODB_CONNECT_ON_START || 'true').toLowerCase());
  const timeoutMs = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000;

  if (!connectOnStart) {
    console.warn('Skipping MongoDB startup connection because MONGODB_CONNECT_ON_START=false.');
    return null;
  }

  if (!mongoUri) {
    if (allowServerWithoutDB) {
      console.warn('MONGODB_URI is not defined. Starting server without database because ALLOW_SERVER_WITHOUT_DB=true.');
      return null;
    }

    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const connectPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
      socketTimeoutMS: timeoutMs,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`MongoDB connection timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    const conn = await Promise.race([connectPromise, timeoutPromise]);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (allowServerWithoutDB) {
      console.warn(`MongoDB connection failed. Starting server without database because ALLOW_SERVER_WITHOUT_DB=true. Reason: ${error.message}`);
      await mongoose.disconnect().catch(() => {});
      return null;
    }

    throw error;
  }
};

const checkConnection = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

module.exports = { connectDB, checkConnection };
