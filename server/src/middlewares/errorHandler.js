import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * Central Error Handler Middleware.
 * Catches all operational and unexpected errors, logs them appropriately,
 * and formats the HTTP response according to the standardized API contract.
 */
export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = err;

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid format for resource ID: ${err.value}`;
    error = new ApiError(400, message, 'INVALID_RESOURCE_ID');
  }

  // Handle Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(422, messages.join('. '), 'VALIDATION_ERROR', messages);
  }

  // Handle MongoDB duplicate key error (code 11000)
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A resource with that ${field} already exists.`;
    error = new ApiError(409, message, 'DUPLICATE_RESOURCE');
  }

  // Handle Multer upload errors
  else if (err.name === 'MulterError') {
    let message = 'File upload error occurred';
    let code = 'FILE_UPLOAD_ERROR';

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds maximum allowed limit (5 MB per image)';
      code = 'FILE_TOO_LARGE';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded (maximum 5 images allowed)';
      code = 'TOO_MANY_FILES';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field}`;
    }

    error = new ApiError(400, message, code);
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token', 'INVALID_TOKEN');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired', 'TOKEN_EXPIRED');
  }

  // Handle standard non-ApiError instances
  else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected internal server error occurred';
    error = new ApiError(statusCode, message, 'INTERNAL_SERVER_ERROR');
  }

  // Log server errors for monitoring
  if (error.statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  const response = {
    success: false,
    message: error.message,
    errorCode: error.errorCode || 'UNKNOWN_ERROR'
  };

  // Include validation error details or stack trace in development
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  if (env.NODE_ENV === 'development' && error.statusCode >= 500) {
    response.stack = err.stack;
  }

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
