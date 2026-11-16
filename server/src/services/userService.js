import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import activityLogService from './activityLogService.js';

export const userService = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found.', 'USER_NOT_FOUND');
    }
    return user;
  },

  /**
   * Update user profile (name, phone, profileImage)
   * Prevents changing sensitive fields like role or isActive through this route.
   */
  async updateProfile(userId, { name, phone, profileImage }) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found.', 'USER_NOT_FOUND');
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : null;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    await activityLogService.logActivity({
      actorId: user._id,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'USER',
      entityId: user._id,
      description: `User ${user.email} updated profile information.`
    });

    return user;
  }
};

export default userService;
