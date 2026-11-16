import Category from '../models/Category.js';
import Item from '../models/Item.js';
import ApiError from '../utils/ApiError.js';
import activityLogService from './activityLogService.js';

export const categoryService = {
  /**
   * List all categories
   */
  async getCategories({ activeOnly = false } = {}) {
    const filter = {};
    if (activeOnly) filter.isActive = true;

    const categories = await Category.find(filter)
      .populate('createdBy', 'name email')
      .sort({ name: 1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);
    const itemCountsMap = {};

    if (categoryIds.length > 0) {
      try {
        const stats = await Item.aggregate([
          { $match: { categoryId: { $in: categoryIds } } },
          { $group: { _id: '$categoryId', count: { $sum: 1 } } }
        ]);
        for (const s of stats) {
          itemCountsMap[s._id.toString()] = s.count;
        }
      } catch {
        // Fallback without counts
      }
    }

    return categories.map((c) => ({
      ...c,
      itemCount: itemCountsMap[c._id.toString()] || 0
    }));
  },

  /**
   * Create a new category (Admin only)
   */
  async createCategory(adminId, { name, description }) {
    const normalizedName = name.trim();

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
    });

    if (existing) {
      throw ApiError.conflict('A category with this name already exists.', 'DUPLICATE_CATEGORY');
    }

    const category = await Category.create({
      name: normalizedName,
      description: description ? description.trim() : null,
      isActive: true,
      createdBy: adminId
    });

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'CATEGORY_CREATED',
      entityType: 'CATEGORY',
      entityId: category._id,
      description: `Category "${category.name}" created by admin.`
    });

    return category;
  },

  /**
   * Update or deactivate a category.
   * Rule: Deactivate categories rather than deleting them if referenced by items.
   */
  async updateCategory(categoryId, adminId, { name, description, isActive }) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw ApiError.notFound('Category not found.', 'CATEGORY_NOT_FOUND');
    }

    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: categoryId }
      });
      if (existing) {
        throw ApiError.conflict('Another category with this name already exists.', 'DUPLICATE_CATEGORY');
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description ? description.trim() : null;
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'CATEGORY_UPDATED',
      entityType: 'CATEGORY',
      entityId: category._id,
      description: `Category "${category.name}" updated (isActive: ${category.isActive}) by admin.`
    });

    return category;
  },

  /**
   * Soft-deactivate a category safely
   */
  async deactivateCategory(categoryId, adminId) {
    // Check if category is used by items
    const itemsCount = await Item.countDocuments({ categoryId });

    const category = await Category.findById(categoryId);
    if (!category) {
      throw ApiError.notFound('Category not found.', 'CATEGORY_NOT_FOUND');
    }

    category.isActive = false;
    await category.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'CATEGORY_DEACTIVATED',
      entityType: 'CATEGORY',
      entityId: category._id,
      description: `Category "${category.name}" deactivated. Currently associated with ${itemsCount} items.`
    });

    return { category, itemsCount };
  }
};

export default categoryService;
