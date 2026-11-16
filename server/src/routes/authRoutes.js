import { Router } from 'express';
import authController from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import validate from '../middlewares/validate.js';
import authenticate, { optionalAuthenticate } from '../middlewares/authenticate.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account (enforces USER role)
 * @access  Public
 */
router.post('/register', validate(registerValidator), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT access token
 * @access  Public
 */
router.post('/login', validate(loginValidator), authController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user account
 * @access  Private (Authenticated)
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout confirmation (clears HTTP-only cookie)
 * @access  Public / Authenticated
 */
router.post('/logout', optionalAuthenticate, authController.logout);

export default router;
