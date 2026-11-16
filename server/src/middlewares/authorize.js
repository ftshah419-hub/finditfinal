import ApiError from '../utils/ApiError.js';

/**
 * Authorization Middleware Factory.
 * Enforces Role-Based Access Control (RBAC).
 *
 * @param  {...string} allowedRoles - List of permitted roles (e.g. 'ADMIN', 'USER')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        ApiError.unauthorized('Authentication required before authorization check.', 'AUTHENTICATION_REQUIRED')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

export default authorize;
