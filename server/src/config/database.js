import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = env.MONGODB_URI;

  if (!mongoUri || mongoUri.includes('YOUR_USERNAME')) {
    throw new Error(
      'MONGODB_URI is not configured in .env. Please provide a valid MongoDB Atlas connection string.'
    );
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'findit', // Explicitly enforce the intended 'findit' database
      serverSelectionTimeoutMS: 10000, // Timeout after 10s if cluster is unreachable
      autoIndex: env.NODE_ENV !== 'production' // Build indexes in dev, manage in prod
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database name: ${conn.connection.name}`);

    // Set up runtime event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB] Connection lost. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[MongoDB] Connection restored.');
    });

    return conn.connection;
  } catch (error) {
    isConnected = false;
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    try {
      await mongoose.disconnect();
      isConnected = false;
      console.log('[MongoDB] Disconnected gracefully.');
    } catch (error) {
      console.error(`[MongoDB] Error during disconnect: ${error.message}`);
    }
  }
};

export default { connectDB, disconnectDB };
