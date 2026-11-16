import Item from '../models/Item.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import uploadService from './uploadService.js';
import activityLogService from './activityLogService.js';

export const itemService = {
  /**
   * Create a new LOST or FOUND item report.
   * New items always start with PENDING status.
   */
  async createItem(userId, itemData, files = []) {
    // Verify that the specified category exists and is currently active
    const category = await Category.findById(itemData.categoryId);
    if (!category || !category.isActive) {
      throw ApiError.badRequest('Selected category does not exist or is inactive.', 'INVALID_CATEGORY');
    }

    // Handle image uploads if any files were attached
    let uploadedImages = [];
    if (files && files.length > 0) {
      uploadedImages = await uploadService.uploadMultipleImages(files, 'findit/items');
    }

    const newItem = await Item.create({
      ...itemData,
      reportedBy: userId,
      status: 'PENDING',
      images: uploadedImages,
      reviewedBy: null,
      reviewedAt: null,
      resolvedAt: null
    });

    await activityLogService.logActivity({
      actorId: userId,
      action: 'ITEM_REPORTED',
      entityType: 'ITEM',
      entityId: newItem._id,
      description: `New ${newItem.type} item reported: "${newItem.title}"`
    });

    return newItem;
  },

  /**
   * Get all items reported by the authenticated user
   */
  async getUserItems(userId, { status, type, page = 1, limit = 10 } = {}) {
    const filter = { reportedBy: userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (Math.max(1, page) - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('categoryId', 'name')
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
   * Retrieve item details with visibility permissions:
   * Approved items are publicly viewable; pending/rejected/resolved items
   * can only be viewed by the reporter or an Admin.
   */
  async getItemById(itemId, currentUser = null) {
    const item = await Item.findById(itemId)
      .populate('categoryId', 'name')
      .populate('reportedBy', 'name email profileImage');

    if (!item) {
      throw ApiError.notFound('Item not found.', 'ITEM_NOT_FOUND');
    }

    const isOwner = currentUser && item.reportedBy && item.reportedBy._id.toString() === currentUser._id.toString();
    const isAdmin = currentUser && currentUser.role === 'ADMIN';

    if (item.status !== 'APPROVED' && !isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this item.', 'ACCESS_DENIED');
    }

    return item;
  },

  /**
   * Update an item reported by the user.
   * Rule: Material edits to an already APPROVED item resets its status to PENDING for re-review.
   */
  async updateUserItem(itemId, userId, updateData, files = []) {
    const item = await Item.findById(itemId);
    if (!item) {
      throw ApiError.notFound('Item not found.', 'ITEM_NOT_FOUND');
    }

    if (item.reportedBy.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only modify items reported by yourself.', 'NOT_ITEM_OWNER');
    }

    if (item.status === 'RESOLVED') {
      throw ApiError.badRequest('Resolved items cannot be modified.', 'ITEM_ALREADY_RESOLVED');
    }

    // If new images provided, upload them
    if (files && files.length > 0) {
      const newImages = await uploadService.uploadMultipleImages(files, 'findit/items');
      item.images = [...(item.images || []), ...newImages].slice(0, 5);
    }

    // Track if material fields were changed
    let materialChange = false;
    const materialFields = ['title', 'description', 'location', 'itemDate', 'categoryId', 'type'];

    materialFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        item[field] = updateData[field];
        materialChange = true;
      }
    });

    // If the item was APPROVED and a material change occurred, reset to PENDING
    if (item.status === 'APPROVED' && materialChange) {
      item.status = 'PENDING';
      item.reviewedBy = null;
      item.reviewedAt = null;
    }

    await item.save();

    await activityLogService.logActivity({
      actorId: userId,
      action: 'ITEM_UPDATED',
      entityType: 'ITEM',
      entityId: item._id,
      description: `Item "${item.title}" updated by reporter. (Status: ${item.status})`
    });

    return item;
  },

  /**
   * Delete or withdraw an item report by the user.
   */
  async deleteUserItem(itemId, userId) {
    const item = await Item.findById(itemId);
    if (!item) {
      throw ApiError.notFound('Item not found.', 'ITEM_NOT_FOUND');
    }

    if (item.reportedBy.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own reported items.', 'NOT_ITEM_OWNER');
    }

    if (item.status === 'RESOLVED') {
      throw ApiError.badRequest('Resolved items cannot be deleted.', 'ITEM_ALREADY_RESOLVED');
    }

    // Clean up uploaded Cloudinary images
    if (item.images && item.images.length > 0) {
      for (const img of item.images) {
        if (img.publicId) {
          await uploadService.deleteImage(img.publicId);
        }
      }
    }

    await item.deleteOne();

    await activityLogService.logActivity({
      actorId: userId,
      action: 'ITEM_DELETED',
      entityType: 'ITEM',
      entityId: itemId,
      description: `Item "${item.title}" deleted by reporter.`
    });

    return { id: itemId, deleted: true };
  }
};

export default itemService;
