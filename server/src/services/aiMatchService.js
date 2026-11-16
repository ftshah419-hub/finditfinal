import AIMatch from '../models/AIMatch.js';
import Item from '../models/Item.js';
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
          select: 'title description location itemDate images reportedBy categoryId',
          populate: { path: 'categoryId', select: 'name' }
        })
        .populate({
          path: 'foundItemId',
          select: 'title description location itemDate images reportedBy categoryId',
          populate: { path: 'categoryId', select: 'name' }
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
   * Fetch AI matches for user-reported lost items.
   * If precomputed records don't exist yet, scans recent approved/pending FOUND items
   * and computes similarity metadata to suggest high-potential matches.
   */
  async getUserAIMatches(userId, lostItemId = null) {
    const lostItemFilter = { reportedBy: userId, type: 'LOST' };
    if (lostItemId) lostItemFilter._id = lostItemId;

    const userLostItems = await Item.find(lostItemFilter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    if (!userLostItems.length) {
      return { lostItems: [], matches: [] };
    }

    const lostItemIds = userLostItems.map((item) => item._id);

    // Fetch existing matches that aren't dismissed
    let matches = await AIMatch.find({
      lostItemId: { $in: lostItemIds },
      status: { $ne: 'DISMISSED' }
    })
      .populate({
        path: 'lostItemId',
        populate: { path: 'categoryId', select: 'name' }
      })
      .populate({
        path: 'foundItemId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'reportedBy', select: 'name email profileImage' }
        ]
      })
      .sort({ similarityScore: -1, createdAt: -1 })
      .lean();

    // If matches are few, perform on-the-fly candidate evaluation with FOUND items
    if (matches.length < 5) {
      const foundItems = await Item.find({
        type: 'FOUND',
        status: { $in: ['APPROVED', 'PENDING'] },
        reportedBy: { $ne: userId }
      })
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      for (const lostItem of userLostItems) {
        for (const foundItem of foundItems) {
          // Check if already matched
          const alreadyMatched = matches.some(
            (m) =>
              m.lostItemId?._id?.toString() === lostItem._id.toString() &&
              m.foundItemId?._id?.toString() === foundItem._id.toString()
          );

          if (alreadyMatched) continue;

          const matchEvaluation = this.evaluateSimilarity(lostItem, foundItem);
          if (matchEvaluation.score >= 50) {
            try {
              const newMatch = await AIMatch.findOneAndUpdate(
                { lostItemId: lostItem._id, foundItemId: foundItem._id },
                {
                  similarityScore: matchEvaluation.score,
                  confidence: matchEvaluation.confidence,
                  matchingFeatures: matchEvaluation.matchingFeatures,
                  differences: matchEvaluation.differences,
                  status: 'PENDING'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              )
                .populate({
                  path: 'lostItemId',
                  populate: { path: 'categoryId', select: 'name' }
                })
                .populate({
                  path: 'foundItemId',
                  populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'reportedBy', select: 'name email profileImage' }
                  ]
                })
                .lean();

              matches.push(newMatch);
            } catch {
              // Ignore unique key race condition
            }
          }
        }
      }
    }

    // Sort by highest similarity score
    matches.sort((a, b) => b.similarityScore - a.similarityScore);

    return {
      lostItems: userLostItems,
      matches
    };
  },

  /**
   * Algorithmic multi-factor similarity evaluation
   */
  evaluateSimilarity(lostItem, foundItem) {
    let score = 0;
    const matchingFeatures = [];
    const differences = [];

    // 1. Category Alignment (35 points)
    const lostCatId = lostItem.categoryId?._id?.toString() || lostItem.categoryId?.toString();
    const foundCatId = foundItem.categoryId?._id?.toString() || foundItem.categoryId?.toString();
    const lostCatName = lostItem.categoryId?.name || '';
    const foundCatName = foundItem.categoryId?.name || '';

    if (lostCatId && foundCatId && lostCatId === foundCatId) {
      score += 35;
      matchingFeatures.push(`Category match: ${lostCatName || 'Same Category'}`);
    } else {
      differences.push('Different categorization');
    }

    // 2. Keyword & Description Overlap (40 points)
    const normalize = (str) =>
      (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !['the', 'and', 'with', 'for', 'was', 'this'].includes(w));

    const lostTokens = [
      ...new Set([...normalize(lostItem.title), ...normalize(lostItem.description)])
    ];
    const foundText = `${foundItem.title || ''} ${foundItem.description || ''}`.toLowerCase();

    let matchedTokens = [];
    lostTokens.forEach((token) => {
      if (foundText.includes(token)) {
        matchedTokens.push(token);
      }
    });

    if (lostTokens.length > 0) {
      const matchRatio = matchedTokens.length / Math.min(lostTokens.length, 6);
      const points = Math.min(40, Math.round(matchRatio * 40));
      score += points;
      if (matchedTokens.length > 0) {
        matchingFeatures.push(
          `Lexical alignment: ${matchedTokens.slice(0, 4).join(', ')}`
        );
      }
    }

    // 3. Geographic / Location Alignment (15 points)
    const lostCity = lostItem.location?.city?.toLowerCase()?.trim();
    const foundCity = foundItem.location?.city?.toLowerCase()?.trim();
    const lostAddr = lostItem.location?.address?.toLowerCase()?.trim();
    const foundAddr = foundItem.location?.address?.toLowerCase()?.trim();

    if (lostCity && foundCity && lostCity === foundCity) {
      score += 10;
      matchingFeatures.push(`Municipal sector match: ${foundItem.location.city}`);
    }
    if (lostAddr && foundAddr && (lostAddr.includes(foundAddr) || foundAddr.includes(lostAddr))) {
      score += 5;
      matchingFeatures.push('Geographic proximity within campus zone');
    }

    // 4. Temporal Proximity (10 points)
    if (lostItem.itemDate && foundItem.itemDate) {
      const diffMs = Math.abs(new Date(foundItem.itemDate) - new Date(lostItem.itemDate));
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 3) {
        score += 10;
        matchingFeatures.push('High temporal correlation: Reported within 3 days');
      } else if (diffDays <= 10) {
        score += 6;
        matchingFeatures.push('Temporal correlation: Reported within 10 days');
      } else if (diffDays > 30) {
        differences.push(`Reporting dates differ by ~${Math.round(diffDays)} days`);
      }
    }

    score = Math.min(96, Math.max(10, score));

    let confidence = 'LOW';
    if (score >= 80) confidence = 'HIGH';
    else if (score >= 55) confidence = 'MEDIUM';

    return {
      score,
      confidence,
      matchingFeatures,
      differences
    };
  },

  /**
   * Dismiss an AI match for a user
   */
  async dismissMatch(matchId, userId) {
    const match = await AIMatch.findById(matchId).populate('lostItemId');
    if (!match) {
      throw ApiError.notFound('AI match suggestion not found.', 'MATCH_NOT_FOUND');
    }

    if (match.lostItemId?.reportedBy?.toString() !== userId.toString()) {
      throw ApiError.forbidden('You do not own the lost item associated with this match.', 'ACCESS_DENIED');
    }

    match.status = 'DISMISSED';
    await match.save();
    return match;
  },

  /**
   * Review an AI match (Admin only).
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
