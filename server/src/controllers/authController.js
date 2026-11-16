import authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

const COOKIE_NAME = 'findit_token';

const getCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  path: '/'
});

export const authController = {
  /**
   * Register a new user account
   * POST /api/v1/auth/register
   */
  register: asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const result = await authService.register({ name, email, password, phone });

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_NAME, result.token, getCookieOptions(false));

    return ApiResponse.created(res, result, 'User registered successfully');
  }),

  /**
   * Log in an existing user
   * POST /api/v1/auth/login
   */
  login: asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login({ email, password });

    // Set secure HTTP-only cookie with rememberMe duration support
    res.cookie(COOKIE_NAME, result.token, getCookieOptions(Boolean(rememberMe)));

    return ApiResponse.ok(res, result, 'Login successful');
  }),

  /**
   * Get current authenticated user profile
   * GET /api/v1/auth/me
   */
  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user._id);
    return ApiResponse.ok(res, { user }, 'Current user profile fetched successfully');
  }),

  /**
   * Log out current user
   * POST /api/v1/auth/logout
   */
  logout: asyncHandler(async (req, res) => {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    return ApiResponse.ok(
      res,
      {},
      'Logout successful. Authentication cookie cleared. (Note: In stateless JWT architecture without a server-side revocation list, previously copied unexpired tokens remain valid until their expiration.)'
    );
  })
};

export default authController;
