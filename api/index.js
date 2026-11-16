import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/database.js';

/**
 * Vercel Serverless Function entrypoint.
 * Connects to MongoDB Atlas (reusing cached connection) and delegates to Express.
 */
export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless] MongoDB connection error:', error.message);
  }
  return app(req, res);
}
