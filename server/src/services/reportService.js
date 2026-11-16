import Report from '../models/Report.js';
import ApiError from '../utils/ApiError.js';
import activityLogService from './activityLogService.js';

export const reportService = {
  /**
   * Submit a new complaint or moderation report.
   * Requires at least one subject: itemId or reportedUserId.
   */
  async createReport(reporterId, { itemId = null, reportedUserId = null, reason, description }) {
    if (!itemId && !reportedUserId) {
      throw ApiError.badRequest('A report must specify either an itemId or reportedUserId.', 'MISSING_REPORT_TARGET');
    }

    const report = await Report.create({
      reporterId,
      itemId: itemId || null,
      reportedUserId: reportedUserId || null,
      reason: reason.trim(),
      description: description.trim(),
      status: 'PENDING'
    });

    await activityLogService.logActivity({
      actorId: reporterId,
      action: 'REPORT_SUBMITTED',
      entityType: 'REPORT',
      entityId: report._id,
      description: `Report submitted by user ${reporterId} regarding reason: ${report.reason}`
    });

    return report;
  },

  /**
   * List reports for Admin moderation
   */
  async getReports({ status, search, page = 1, limit = 10 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ reason: searchRegex }, { description: searchRegex }];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporterId', 'name email')
        .populate('reportedUserId', 'name email')
        .populate('itemId', 'title type status')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter)
    ]);

    return {
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Review a report (Admin only)
   */
  async reviewReport(reportId, adminId, { status, adminNote = null }) {
    if (!['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'].includes(status)) {
      throw ApiError.badRequest('Invalid report review status.', 'INVALID_STATUS');
    }

    const report = await Report.findById(reportId);
    if (!report) {
      throw ApiError.notFound('Report not found.', 'REPORT_NOT_FOUND');
    }

    report.status = status;
    report.reviewedBy = adminId;
    report.reviewedAt = new Date();
    if (adminNote) report.adminNote = adminNote.trim();

    await report.save();

    await activityLogService.logActivity({
      actorId: adminId,
      action: 'REPORT_REVIEWED',
      entityType: 'REPORT',
      entityId: report._id,
      description: `Report ${report._id} marked as ${status} by admin.`
    });

    return report;
  }
};

export default reportService;
