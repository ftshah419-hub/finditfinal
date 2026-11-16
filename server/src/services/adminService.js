import mongoose from 'mongoose';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Report from '../models/Report.js';
import AIMatch from '../models/AIMatch.js';
import Category from '../models/Category.js';
import SystemSetting from '../models/SystemSetting.js';
import ApiError from '../utils/ApiError.js';
import activityLogService from './activityLogService.js';
import notificationService from './notificationService.js';

export const adminService = {
  /**
   * Get administrative dashboard summary metrics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalItems,
      lostItems,
      foundItems,
      pendingItems,
      approvedItems,
      rejectedItems,
      resolvedItems,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      pendingReports,
      pendingAIMatches,
      recentItems,
      recentClaims,
      recentUsers,
      recentLogs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'ADMIN' }),
      Item.countDocuments(),
      Item.countDocuments({ type: 'LOST' }),
      Item.countDocuments({ type: 'FOUND' }),
      Item.countDocuments({ status: 'PENDING' }),
      Item.countDocuments({ status: 'APPROVED' }),
      Item.countDocuments({ status: 'REJECTED' }),
      Item.countDocuments({ status: 'RESOLVED' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'PENDING' }),
      Claim.countDocuments({ status: 'APPROVED' }),
      Claim.countDocuments({ status: 'REJECTED' }),
      Report.countDocuments({ status: 'PENDING' }),
      AIMatch.countDocuments({ status: 'PENDING' }),
      Item.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('reportedBy', 'name email')
        .populate('categoryId', 'name')
        .lean(),
      Claim.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('claimantId', 'name email')
        .populate('itemId', 'title type status location images')
        .lean(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role isActive createdAt')
        .lean(),
      activityLogService.getLogs({ limit: 6 })
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: Math.max(0, totalUsers - activeUsers),
        adminStaff: adminUsers
      },
      items: {
        total: totalItems,
        lost: lostItems,
        found: foundItems,
        pending: pendingItems,
        approved: approvedItems,
        rejected: rejectedItems,
        resolved: resolvedItems
      },
      claims: {
        total: totalClaims,
        pending: pendingClaims,
        approved: approvedClaims,
        rejected: rejectedClaims
      },
      reports: { pending: pendingReports },
      aiMatches: { pending: pendingAIMatches },
      recentItems,
      recentClaims,
      recentUsers,
      recentLogs: recentLogs?.logs || []
    };
  },

  /**
   * Get paginated users with optional search/filter
   */
  async getAllUsers({ role, isActive, search, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Aggregate report and claim counts for these users
    const userIds = users.map((u) => u._id);
    let itemCountsMap = {};
    let claimCountsMap = {};

    if (userIds.length > 0) {
      try {
        const [itemStats, claimStats] = await Promise.all([
          Item.aggregate([
            { $match: { reportedBy: { $in: userIds } } },
            { $group: { _id: { user: '$reportedBy', type: '$type' }, count: { $sum: 1 } } }
          ]),
          Claim.aggregate([
            { $match: { claimantId: { $in: userIds } } },
            { $group: { _id: '$claimantId', count: { $sum: 1 } } }
          ])
        ]);

        for (const stat of itemStats) {
          const userIdStr = stat._id.user.toString();
          if (!itemCountsMap[userIdStr]) {
            itemCountsMap[userIdStr] = { lost: 0, found: 0, total: 0 };
          }
          if (stat._id.type === 'LOST') {
            itemCountsMap[userIdStr].lost += stat.count;
          } else if (stat._id.type === 'FOUND') {
            itemCountsMap[userIdStr].found += stat.count;
          }
          itemCountsMap[userIdStr].total += stat.count;
        }

        for (const stat of claimStats) {
          const userIdStr = stat._id.toString();
          claimCountsMap[userIdStr] = stat.count;
        }
      } catch {
        // Fallback gracefully without aggregate counts
      }
    }

    const enrichedUsers = users.map((u) => {
      const uId = u._id.toString();
      return {
        ...u,
        reportsSummary: itemCountsMap[uId] || { lost: 0, found: 0, total: 0 },
        claimsCount: claimCountsMap[uId] || 0
      };
    });

    return {
      users: enrichedUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get user details by ID along with recent reports and claims
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.', 'USER_NOT_FOUND');
    }

    const [items, claims, reportsCount, claimsCount] = await Promise.all([
      Item.find({ reportedBy: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('categoryId', 'name')
        .lean(),
      Claim.find({ claimantId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('itemId', 'title type status location images')
        .lean(),
      Item.countDocuments({ reportedBy: userId }),
      Claim.countDocuments({ claimantId: userId })
    ]);

    return {
      ...(user.toObject ? user.toObject() : user),
      reportsCount,
      claimsCount,
      recentItems: items,
      recentClaims: claims
    };
  },

  /**
   * Update active status of a user (deactivate/activate)
   */
  async updateUserStatus(targetUserId, isActive, adminId) {
    if (targetUserId.toString() === adminId.toString()) {
      throw ApiError.badRequest('You cannot deactivate your own admin account.', 'CANNOT_DEACTIVATE_SELF');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw ApiError.notFound('User not found.', 'USER_NOT_FOUND');
    }

    user.isActive = Boolean(isActive);
    await user.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'USER',
      entityId: user._id,
      description: `User account ${user.email} status changed to isActive=${user.isActive} by admin.`
    });

    return user;
  },

  /**
   * Get all items for admin review
   */
  async getAllItems({ status, type, categoryId, search, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (categoryId) filter.categoryId = categoryId;

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { 'location.address': regex },
        { 'location.city': regex }
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('reportedBy', 'name email')
        .populate('categoryId', 'name')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get item details for admin
   */
  async getItemById(itemId) {
    const item = await Item.findById(itemId)
      .populate('reportedBy', 'name email phone')
      .populate('categoryId', 'name')
      .populate('reviewedBy', 'name email');

    if (!item) {
      throw ApiError.notFound('Item not found.', 'ITEM_NOT_FOUND');
    }

    const claims = await Claim.find({ itemId })
      .populate('claimantId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return {
      ...(item.toObject ? item.toObject() : item),
      claims
    };
  },

  /**
   * Approve an item report
   */
  async approveItem(itemId, adminId) {
    const item = await Item.findById(itemId);
    if (!item) {
      throw ApiError.notFound('Item not found.', 'ITEM_NOT_FOUND');
    }

    if (item.status === 'RESOLVED') {
      throw ApiError.badRequest('Cannot approve an already resolved item.', 'ITEM_ALREADY_RESOLVED');
    }

    item.status = 'APPROVED';
    item.reviewedBy = adminId;
    item.reviewedAt = new Date();
    item.rejectionReason = null;
    await item.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'ITEM_APPROVED',
      entityType: 'ITEM',
      entityId: item._id,
      description: `Item "${item.title}" approved by admin.`
    });

    // Notify the reporter
    await notificationService.createNotification({
      recipientId: item.reportedBy,
      relatedItemId: item._id,
      title: 'Item Report Approved',
      message: `Your reported ${item.type} item "${item.title}" has been approved and is now publicly visible.`,
      type: 'ITEM_APPROVED'
    });

    return item;
  },

  /**
   * Reject an item report with reason
   */
  async rejectItem(itemId, adminId, rejectionReason) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw ApiError.badRequest('Rejection reason is required.', 'REASON_REQUIRED');
    }

    const item = await Item.findById(itemId);
    if (!item) {
      throw ApiError.notFound('Item not found.', 'ITEM_NOT_FOUND');
    }

    if (item.status === 'RESOLVED') {
      throw ApiError.badRequest('Cannot reject an already resolved item.', 'ITEM_ALREADY_RESOLVED');
    }

    item.status = 'REJECTED';
    item.reviewedBy = adminId;
    item.reviewedAt = new Date();
    item.rejectionReason = rejectionReason.trim();
    await item.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'ITEM_REJECTED',
      entityType: 'ITEM',
      entityId: item._id,
      description: `Item "${item.title}" rejected by admin. Reason: ${rejectionReason}`
    });

    // Notify the reporter
    await notificationService.createNotification({
      recipientId: item.reportedBy,
      relatedItemId: item._id,
      title: 'Item Report Rejected',
      message: `Your reported ${item.type} item "${item.title}" was rejected. Reason: ${rejectionReason}`,
      type: 'ITEM_REJECTED'
    });

    return item;
  },

  /**
   * Get all claims for moderation
   */
  async getAllClaims({ status, itemId, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (itemId) filter.itemId = itemId;

    const skip = (Math.max(1, page) - 1) * limit;

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('claimantId', 'name email phone')
        .populate('reviewedBy', 'name email')
        .populate({
          path: 'itemId',
          select: 'title type status location images'
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
   * Atomically approve a claim and resolve the item.
   * Ensures that only one claim can ever resolve an item.
   * Safely rejects all other competing pending claims on the same item.
   */
  async approveClaim(claimId, adminId) {
    const claim = await Claim.findById(claimId);
    if (!claim) {
      throw ApiError.notFound('Claim not found.', 'CLAIM_NOT_FOUND');
    }

    if (claim.status !== 'PENDING') {
      throw ApiError.badRequest(`Cannot approve a claim with status '${claim.status}'.`, 'CLAIM_NOT_PENDING');
    }

    // Try MongoDB session transaction first (supported in replica sets / MongoDB Atlas)
    let session = null;
    let useTransaction = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch {
      // In standalone or environments where replica sets are not enabled,
      // fallback gracefully to atomic conditional update strategy.
      useTransaction = false;
    }

    try {
      const now = new Date();

      if (useTransaction) {
        // Atomic transaction path
        const item = await Item.findOneAndUpdate(
          { _id: claim.itemId, status: 'APPROVED' },
          { $set: { status: 'RESOLVED', resolvedAt: now, reviewedBy: adminId } },
          { session, new: true }
        );

        if (!item) {
          throw ApiError.conflict(
            'Cannot approve claim: The item is no longer in APPROVED status or was already resolved by another claim.',
            'ITEM_NOT_AVAILABLE_FOR_RESOLUTION'
          );
        }

        claim.status = 'APPROVED';
        claim.reviewedBy = adminId;
        claim.reviewedAt = now;
        await claim.save({ session });

        // Reject competing pending claims on this item
        await Claim.updateMany(
          { itemId: claim.itemId, _id: { $ne: claim._id }, status: 'PENDING' },
          {
            $set: {
              status: 'REJECTED',
              reviewedBy: adminId,
              reviewedAt: now,
              adminNote: 'Item resolved by another verified claim.'
            }
          },
          { session }
        );

        await session.commitTransaction();
      } else {
        // Safe Conditional Atomic Update Strategy (concurrency-safe without replica set)
        const item = await Item.findOneAndUpdate(
          { _id: claim.itemId, status: 'APPROVED' },
          { $set: { status: 'RESOLVED', resolvedAt: now, reviewedBy: adminId } },
          { new: true }
        );

        if (!item) {
          throw ApiError.conflict(
            'Cannot approve claim: The item is no longer in APPROVED status or was already resolved by another claim.',
            'ITEM_NOT_AVAILABLE_FOR_RESOLUTION'
          );
        }

        claim.status = 'APPROVED';
        claim.reviewedBy = adminId;
        claim.reviewedAt = now;
        await claim.save();

        // Reject competing pending claims on this item
        await Claim.updateMany(
          { itemId: claim.itemId, _id: { $ne: claim._id }, status: 'PENDING' },
          {
            $set: {
              status: 'REJECTED',
              reviewedBy: adminId,
              reviewedAt: now,
              adminNote: 'Item resolved by another verified claim.'
            }
          }
        );
      }

      await activityLogService.logActivity({
        actorId: adminId,
        action: 'CLAIM_APPROVED',
        entityType: 'CLAIM',
        entityId: claim._id,
        description: `Claim ${claim._id} approved by admin. Item ${claim.itemId} marked as RESOLVED.`
      });

      // Notify the winning claimant
      await notificationService.createNotification({
        recipientId: claim.claimantId,
        relatedItemId: claim.itemId,
        title: 'Claim Approved!',
        message: 'Your ownership claim has been verified and approved by the administrators.',
        type: 'CLAIM_APPROVED'
      });

      return claim;
    } catch (error) {
      if (useTransaction && session) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  },

  /**
   * Reject a claim (does not resolve the item)
   */
  async rejectClaim(claimId, adminId, adminNote = null) {
    const claim = await Claim.findById(claimId);
    if (!claim) {
      throw ApiError.notFound('Claim not found.', 'CLAIM_NOT_FOUND');
    }

    if (claim.status !== 'PENDING') {
      throw ApiError.badRequest(`Cannot reject a claim with status '${claim.status}'.`, 'CLAIM_NOT_PENDING');
    }

    claim.status = 'REJECTED';
    claim.reviewedBy = adminId;
    claim.reviewedAt = new Date();
    if (adminNote) claim.adminNote = adminNote.trim();
    await claim.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'CLAIM_REJECTED',
      entityType: 'CLAIM',
      entityId: claim._id,
      description: `Claim ${claim._id} rejected by admin. (Note: ${adminNote || 'None'})`
    });

    // Notify the claimant
    await notificationService.createNotification({
      recipientId: claim.claimantId,
      relatedItemId: claim.itemId,
      title: 'Claim Update',
      message: 'Your ownership claim could not be verified at this time.',
      type: 'CLAIM_REJECTED'
    });

    return claim;
  },

  /**
   * Retrieve all system settings
   */
  async getSettings() {
    return SystemSetting.find()
      .populate('updatedBy', 'name email')
      .sort({ key: 1 })
      .lean();
  },

  /**
   * Create or update a system setting
   */
  async updateSetting(key, value, adminId, description = null) {
    const update = {
      value,
      updatedBy: adminId,
      updatedAt: new Date()
    };
    if (description) update.description = description;

    const setting = await SystemSetting.findOneAndUpdate(
      { key: key.trim() },
      { $set: update },
      { new: true, upsert: true }
    );

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'SETTING_UPDATED',
      entityType: 'SETTING',
      entityId: setting._id,
      description: `System setting "${key}" updated by admin.`
    });

    return setting;
  }
};

export default adminService;
