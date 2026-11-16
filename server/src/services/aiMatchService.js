import AIMatch from '../models/AIMatch.js';
import ApiError from '../utils/ApiError.js';
import activityLogService from './activityLogService.js';

export const aiMatchService = {
  /**
   * Fetch AI match suggestions for admin review
   */
  async getAIMatches({ status, confidence, page = 1, limit = 10 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (confidence) filter.confidence = confidence;

    const skip = (Math.max(1, page) - 1) * limit;

    const [matches, total] = await Promise.all([
      AIMatch.find(filter)
        .populate({
          path: 'lostItemId',
          select: 'title description location itemDate images reportedBy'
        })
        .populate({
          path: 'foundItemId',
          select: 'title description location itemDate images reportedBy'
        })
        .sort({ similarityScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AIMatch.countDocuments(filter)
    ]);

    return {
      matches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Review an AI match.
   * NOTE: Per business rules, AI matching is advisory only; confirming an AI match
   * updates the match review status but NEVER automatically resolves items or approves claims.
   */
  async reviewMatch(matchId, adminId, { status }) {
    if (!['REVIEWED', 'CONFIRMED', 'DISMISSED'].includes(status)) {
      throw ApiError.badRequest('Invalid AI match review status.', 'INVALID_STATUS');
    }

    const match = await AIMatch.findById(matchId);
    if (!match) {
      throw ApiError.notFound('AI match suggestion not found.', 'MATCH_NOT_FOUND');
    }

    match.status = status;
    match.reviewedBy = adminId;
    await match.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'AI_MATCH_REVIEWED',
      entityType: 'AI_MATCH',
      entityId: match._id,
      description: `AI Match ${match._id} set to ${status} by admin.`
    });

    return match;
  }
};

export default aiMatchService;
