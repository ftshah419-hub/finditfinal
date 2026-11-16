import app from './app.js';
import { connectDB } from './config/database.js';

let isConnecting = false;

// Middleware to ensure MongoDB Atlas connection on every serverless invocation
app.use(async (req, res, next) => {
  try {
    if (!isConnecting) {
      isConnecting = true;
      await connectDB();
      isConnecting = false;
    }
    next();
  } catch (err) {
    isConnecting = false;
    console.error('[Serverless DB Error]:', err.message);
    next(err);
  }
});

export default app;
