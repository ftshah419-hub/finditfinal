import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

export const notificationService = {
  /**
   * Create a new notification for a user
   */
  async createNotification({ recipientId, relatedItemId = null, title, message, type = 'SYSTEM' }) {
    return Notification.create({
      recipientId,
      relatedItemId,
      title: title.trim(),
      message: message.trim(),
      type,
      isRead: false
    });
  },

  /**
   * Get notifications for the authenticated user
   */
  async getUserNotifications(userId, { isRead, page = 1, limit = 20 } = {}) {
    const filter = { recipientId: userId };
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true' || isRead === true;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('relatedItemId', 'title type status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId: userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found.', 'NOTIFICATION_NOT_FOUND');
    }

    if (notification.recipientId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only modify your own notifications.', 'ACCESS_DENIED');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }
};

export default notificationService;
