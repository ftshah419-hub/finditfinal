import ActivityLog from '../models/ActivityLog.js';

/**
 * Common Activity Logging Service used across all modules.
 * Records audit trails for sensitive, administrative, and core business events.
 */
export const activityLogService = {
  /**
   * Log an activity record
   *
   * @param {Object} params
   * @param {string|ObjectId} [params.actorId] - User initiating action
   * @param {string} params.action - Controlled action keyword (e.g. 'ITEM_APPROVED', 'USER_REGISTERED')
   * @param {string} params.entityType - 'USER' | 'ITEM' | 'CLAIM' | 'REPORT' | 'CATEGORY' | 'SETTING' | 'SYSTEM' | 'AI_MATCH'
   * @param {string|ObjectId} [params.entityId] - Targeted entity ID
   * @param {string} params.description - Human-readable message
   * @param {Object} [params.metadata] - Non-sensitive context data
   */
  async logActivity({ actorId = null, action, entityType, entityId = null, description, metadata = {} }) {
    try {
      // Sanitize metadata to ensure secrets, tokens, or passwords are never stored
      const sanitizedMetadata = { ...metadata };
      const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'apiKey', 'authorization'];

      for (const key of Object.keys(sanitizedMetadata)) {
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
          delete sanitizedMetadata[key];
        }
      }

      await ActivityLog.create({
        actorId,
        action,
        entityType,
        entityId,
        description,
        metadata: sanitizedMetadata
      });
    } catch (error) {
      // Never crash the primary operation if logging encounters an issue
      console.warn(`[ActivityLog] Failed to record activity log for action '${action}': ${error.message}`);
    }
  },

  /**
   * Fetch activity logs with pagination and filters
   */
  async getLogs({ page = 1, limit = 20, entityType, actorId, search } = {}) {
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (actorId) filter.actorId = actorId;
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ action: searchRegex }, { description: searchRegex }];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('actorId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    return {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
};

export default activityLogService;
