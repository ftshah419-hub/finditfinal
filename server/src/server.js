import app from './app.js';
import env, { validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';

let server;

const startServer = async () => {
  try {
    console.log('='.repeat(60));
    console.log('  FINDIT — Lost & Found Management Platform Backend');
    console.log('  Mode: ' + env.NODE_ENV);
    console.log('='.repeat(60));

    // 1. Validate required environment variables
    const envCheck = validateEnv();
    if (!envCheck.isValid) {
      console.error('\n[Configuration Error]');
      console.error(envCheck.message);
      console.error('Please configure your server/.env file before starting the server.');
      console.error('Refer to server/.env.example for template values.\n');
      process.exit(1);
    }

    // 2. Connect to MongoDB Atlas before launching server
    console.log('[Database] Connecting to MongoDB Atlas...');
    await connectDB();

    // 3. Start Express HTTP Server only after successful DB connection
    const PORT = env.PORT || 5000;
    server = app.listen(PORT, () => {
      console.log(`[Server] Express server running on port ${PORT}`);
      console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/v1/health`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error(`\n[Fatal Startup Error] Failed to initialize backend server: ${error.message}\n`);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Closing server and database connection gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      console.log('[Shutdown] Graceful exit complete.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  // Force close after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('[Shutdown] Forced termination due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception] thrown:', error);
  process.exit(1);
});

startServer();
