import Item from '../models/Item.js';

export const searchService = {
  /**
   * Search publicly visible (APPROVED) items.
   *
   * @param {Object} queryParams
   * @param {string} [queryParams.q] - Keyword query
   * @param {string} [queryParams.type] - 'LOST' | 'FOUND'
   * @param {string} [queryParams.categoryId] - Filter by category
   * @param {string} [queryParams.city] - Filter by city
   * @param {string} [queryParams.state] - Filter by state
   * @param {string} [queryParams.startDate] - ISO Date string
   * @param {string} [queryParams.endDate] - ISO Date string
   * @param {number} [queryParams.page=1]
   * @param {number} [queryParams.limit=12]
   */
  async searchApprovedItems({
    q,
    type,
    categoryId,
    city,
    state,
    startDate,
    endDate,
    page = 1,
    limit = 12
  } = {}) {
    // Only approved items are publicly visible
    const filter = { status: 'APPROVED' };

    if (type) filter.type = type;
    if (categoryId) filter.categoryId = categoryId;
    if (city) filter['location.city'] = new RegExp(city.trim(), 'i');
    if (state) filter['location.state'] = new RegExp(state.trim(), 'i');

    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.address': searchRegex },
        { 'location.city': searchRegex }
      ];
    }

    if (startDate || endDate) {
      filter.itemDate = {};
      if (startDate) filter.itemDate.$gte = new Date(startDate);
      if (endDate) filter.itemDate.$lte = new Date(endDate);
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('categoryId', 'name')
        .select('-reviewedBy -rejectionReason') // Keep public responses clean of administrative data
        .sort({ itemDate: -1, createdAt: -1 })
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
  }
};

export default searchService;
