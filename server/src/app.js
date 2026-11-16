import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import ApiError from './utils/ApiError.js';
import ApiResponse from './utils/ApiResponse.js';
import errorHandler from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security HTTP headers
// In development, disable strict CSP to avoid blocking browser extensions and Vite HMR
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
  })
);

// Favicon handler to avoid 404 logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Cross-Origin Resource Sharing (CORS) configuration
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, `CORS policy blocked access from origin: ${origin}`, 'CORS_ERROR'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global rate limiter for sensitive authentication endpoints (prevent brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  }
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  return ApiResponse.ok(
    res,
    {
      status: 'healthy',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    'FINDIT Lost & Found API is healthy and operational'
  );
});

// Mount route groups exactly once
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// Catch-all 404 handler for undefined routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
});

// Central Error Handler Middleware
app.use(errorHandler);

export default app;
