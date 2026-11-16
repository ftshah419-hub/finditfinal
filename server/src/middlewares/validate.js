import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validation runner middleware.
 * Executes an array of express-validator chains and checks the validation result.
 * If errors are detected, formats them into a readable structure and throws an ApiError.
 *
 * @param {Array} validations - Array of validation chains
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations sequentially or in parallel
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return next(
      new ApiError(
        422,
        formattedErrors[0]?.message || 'Validation failed for request data',
        'VALIDATION_ERROR',
        formattedErrors
      )
    );
  };
};

export default validate;
