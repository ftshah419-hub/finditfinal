import userService from '../services/userService.js';
import itemService from '../services/itemService.js';
import claimService from '../services/claimService.js';
import searchService from '../services/searchService.js';
import notificationService from '../services/notificationService.js';
import reportService from '../services/reportService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const userController = {
  // ── Profile ─────────────────────────────────────────────────────────────
  getProfile: asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user._id);
    return ApiResponse.ok(res, { user }, 'Profile retrieved successfully');
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const { name, phone, profileImage } = req.body;
    const user = await userService.updateProfile(req.user._id, { name, phone, profileImage });
    return ApiResponse.ok(res, { user }, 'Profile updated successfully');
  }),

  // ── Items ───────────────────────────────────────────────────────────────
  getMyItems: asyncHandler(async (req, res) => {
    const { status, type, page, limit } = req.query;
    const result = await itemService.getUserItems(req.user._id, { status, type, page, limit });
    return ApiResponse.ok(res, result, 'User items retrieved successfully');
  }),

  createItem: asyncHandler(async (req, res) => {
    // Location can come as an object or parsed JSON if sent via multipart/form-data
    let location = req.body.location;
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch {
        // Fallback to location fields on root if separate
      }
    }

    const itemData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      categoryId: req.body.categoryId,
      itemDate: req.body.itemDate,
      location: location || {
        address: req.body['location.address'] || req.body.address,
        city: req.body['location.city'] || req.body.city,
        district: req.body['location.district'] || req.body.district,
        state: req.body['location.state'] || req.body.state,
        coordinates: {
          latitude: req.body['location.coordinates.latitude'] || req.body.latitude,
          longitude: req.body['location.coordinates.longitude'] || req.body.longitude
        }
      }
    };

    const item = await itemService.createItem(req.user._id, itemData, req.files);
    return ApiResponse.created(res, { item }, 'Item report created successfully with PENDING status');
  }),

  getItemDetails: asyncHandler(async (req, res) => {
    const item = await itemService.getItemById(req.params.id, req.user);
    return ApiResponse.ok(res, { item }, 'Item details retrieved successfully');
  }),

  updateItem: asyncHandler(async (req, res) => {
    let location = req.body.location;
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch {
        // Ignored
      }
    }

    const updateData = { ...req.body };
    if (location) updateData.location = location;

    const updatedItem = await itemService.updateUserItem(
      req.params.id,
      req.user._id,
      updateData,
      req.files
    );
    return ApiResponse.ok(res, { item: updatedItem }, 'Item updated successfully');
  }),

  deleteItem: asyncHandler(async (req, res) => {
    const result = await itemService.deleteUserItem(req.params.id, req.user._id);
    return ApiResponse.ok(res, result, 'Item deleted successfully');
  }),

  // ── Claims ──────────────────────────────────────────────────────────────
  getMyClaims: asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await claimService.getUserClaims(req.user._id, { status, page, limit });
    return ApiResponse.ok(res, result, 'User claims retrieved successfully');
  }),

  submitClaim: asyncHandler(async (req, res) => {
    const itemId = req.params.id;
    const { proofDescription } = req.body;
    const claim = await claimService.createClaim(
      itemId,
      req.user._id,
      { proofDescription },
      req.files
    );
    return ApiResponse.created(res, { claim }, 'Ownership claim submitted successfully');
  }),

  withdrawClaim: asyncHandler(async (req, res) => {
    const claim = await claimService.withdrawClaim(req.params.id, req.user._id);
    return ApiResponse.ok(res, { claim }, 'Claim withdrawn successfully');
  }),

  // ── Notifications ───────────────────────────────────────────────────────
  getMyNotifications: asyncHandler(async (req, res) => {
    const { isRead, page, limit } = req.query;
    const result = await notificationService.getUserNotifications(req.user._id, { isRead, page, limit });
    return ApiResponse.ok(res, result, 'Notifications retrieved successfully');
  }),

  markNotificationRead: asyncHandler(async (req, res) => {
    const notification = await notificationService.markNotificationAsRead(req.params.id, req.user._id);
    return ApiResponse.ok(res, { notification }, 'Notification marked as read');
  }),

  // ── Public Search ───────────────────────────────────────────────────────
  searchItems: asyncHandler(async (req, res) => {
    const result = await searchService.searchApprovedItems(req.query);
    return ApiResponse.ok(res, result, 'Search completed successfully');
  }),

  // ── Complaints / Reports ────────────────────────────────────────────────
  submitReport: asyncHandler(async (req, res) => {
    const { itemId, reportedUserId, reason, description } = req.body;
    const report = await reportService.createReport(req.user._id, {
      itemId,
      reportedUserId,
      reason,
      description
    });
    return ApiResponse.created(res, { report }, 'Complaint submitted successfully for administrative review');
  })
};

export default userController;
