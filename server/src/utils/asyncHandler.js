/**
 * Higher-order utility function to wrap asynchronous Express middleware and controllers,
 * catching any rejected promises and passing errors to the next() error handler.
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
