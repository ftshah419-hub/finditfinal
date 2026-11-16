import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const COOKIE_NAME = 'findit_token';

/**
 * Authentication Middleware.
 * Reads JWT token from secure HTTP-only cookie first, falls back to
 * Authorization: Bearer <token> header for maximum API client compatibility.
 * Validates the token against current database state.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. No token provided.', 'AUTHENTICATION_REQUIRED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Look up user in database to ensure the account still exists, is active, and fetch fresh role
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('The user account for this token no longer exists.', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid authentication token.', 'INVALID_TOKEN');
  }
});

/**
 * Optional Authentication Middleware.
 * If a token is provided via cookie or header, attempts to authenticate the user.
 * If no token is provided, continues with req.user = null without throwing an error.
 */
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    req.user = user && user.isActive ? user : null;
  } catch {
    req.user = null;
  }

  next();
});

export default authenticate;
