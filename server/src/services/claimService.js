import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import ApiError from '../utils/ApiError.js';
import uploadService from './uploadService.js';
import activityLogService from './activityLogService.js';

export const claimService = {
  /**
   * Submit an ownership claim for a FOUND item.
   * Rules:
   * 1. Item must be FOUND type.
   * 2. Item must be APPROVED.
   * 3. Item must not be already RESOLVED.
   * 4. User cannot claim their own found item.
   * 5. User cannot submit duplicate pending claims for the same item.
   */
  async createClaim(itemId, userId, claimData, files = []) {
    const item = await Item.findById(itemId);
    if (!item) {
      throw ApiError.notFound('Item not found.', 'ITEM_NOT_FOUND');
    }

    if (item.type !== 'FOUND') {
      throw ApiError.badRequest('Claims can only be filed against FOUND items.', 'INVALID_ITEM_TYPE_FOR_CLAIM');
    }

    if (item.status !== 'APPROVED') {
      throw ApiError.badRequest('Claims can only be submitted for approved items.', 'ITEM_NOT_APPROVED');
    }

    if (item.reportedBy.toString() === userId.toString()) {
      throw ApiError.badRequest('You cannot submit an ownership claim on an item you reported found.', 'CANNOT_CLAIM_OWN_ITEM');
    }

    // Check for existing active claim by the same user
    const existingClaim = await Claim.findOne({
      itemId,
      claimantId: userId,
      status: { $in: ['PENDING', 'APPROVED'] }
    });

    if (existingClaim) {
      throw ApiError.conflict('You already have an active claim for this item.', 'DUPLICATE_CLAIM');
    }

    // Handle evidence images if provided
    let uploadedEvidence = [];
    if (files && files.length > 0) {
      uploadedEvidence = await uploadService.uploadMultipleImages(files, 'findit/evidence');
    }

    const newClaim = await Claim.create({
      itemId,
      claimantId: userId,
      proofDescription: claimData.proofDescription,
      evidence: uploadedEvidence,
      status: 'PENDING'
    });

    await activityLogService.logActivity({
      actorId: userId,
      action: 'CLAIM_SUBMITTED',
      entityType: 'CLAIM',
      entityId: newClaim._id,
      description: `Ownership claim submitted for item "${item.title}" by claimant ${userId}`
    });

    return newClaim;
  },

  /**
   * Get all claims submitted by the authenticated user
   */
  async getUserClaims(userId, { status, page = 1, limit = 10 } = {}) {
    const filter = { claimantId: userId };
    if (status) filter.status = status;

    const skip = (Math.max(1, page) - 1) * limit;

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate({
          path: 'itemId',
          select: 'title type status location itemDate images'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(filter)
    ]);

    return {
      claims,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Withdraw a pending claim
   */
  async withdrawClaim(claimId, userId) {
    const claim = await Claim.findById(claimId);
    if (!claim) {
      throw ApiError.notFound('Claim not found.', 'CLAIM_NOT_FOUND');
    }

    if (claim.claimantId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only withdraw your own claims.', 'NOT_CLAIM_OWNER');
    }

    if (claim.status !== 'PENDING') {
      throw ApiError.badRequest(`Cannot withdraw a claim with status '${claim.status}'.`, 'CLAIM_NOT_PENDING');
    }

    claim.status = 'WITHDRAWN';
    await claim.save();

    await activityLogService.logActivity({
      actorId: userId,
      action: 'CLAIM_WITHDRAWN',
      entityType: 'CLAIM',
      entityId: claim._id,
      description: `Claim ${claim._id} withdrawn by claimant.`
    });

    return claim;
  }
};

export default claimService;
