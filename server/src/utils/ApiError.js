/**
 * Custom application error class for standardized operational API errors.
 */
export class ApiError extends Error {
  constructor(
    statusCode = 500,
    message = 'Something went wrong',
    errorCode = 'INTERNAL_SERVER_ERROR',
    errors = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.success = false;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errorCode = 'BAD_REQUEST', errors = []) {
    return new ApiError(400, message, errorCode, errors);
  }

  static unauthorized(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = 'Forbidden access', errorCode = 'FORBIDDEN') {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message = 'Resource conflict', errorCode = 'CONFLICT') {
    return new ApiError(409, message, errorCode);
  }

  static unprocessable(message = 'Validation failed', errorCode = 'VALIDATION_ERROR', errors = []) {
    return new ApiError(422, message, errorCode, errors);
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL_SERVER_ERROR') {
    return new ApiError(500, message, errorCode);
  }
}

export default ApiError;
