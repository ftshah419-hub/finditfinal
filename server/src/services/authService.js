import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import activityLogService from './activityLogService.js';

/**
 * Generates a signed JSON Web Token for an authenticated user.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
};

export const authService = {
  /**
   * Register a new user account.
   * Public registration always enforces the 'USER' role server-side.
   */
  async register({ name, email, password, phone = null }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    // Always enforce USER role server-side
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : null,
      role: 'USER',
      isActive: true
    });

    const token = generateToken(newUser);

    // Audit log account creation
    await activityLogService.logActivity({
      actorId: newUser._id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: newUser._id,
      description: `New user registered with email: ${newUser.email}`
    });

    return {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        profileImage: newUser.profileImage,
        createdAt: newUser.createdAt
      },
      token
    };
  },

  /**
   * Authenticate an existing user with email and password.
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Explicitly select password field which is hidden by default in schema
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user);

    // Audit log login
    await activityLogService.logActivity({
      actorId: user._id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user._id,
      description: `User logged in: ${user.email}`
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      },
      token
    };
  },

  /**
   * Get current authenticated user details.
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.', 'USER_NOT_FOUND');
    }
    return user;
  }
};

export default authService;
