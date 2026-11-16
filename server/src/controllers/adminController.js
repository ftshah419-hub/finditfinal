import adminService from '../services/adminService.js';
import categoryService from '../services/categoryService.js';
import reportService from '../services/reportService.js';
import aiMatchService from '../services/aiMatchService.js';
import activityLogService from '../services/activityLogService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const adminController = {
  // ── Dashboard Metrics ───────────────────────────────────────────────────
  getDashboard: asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    return ApiResponse.ok(res, { stats }, 'Dashboard metrics fetched successfully');
  }),

  // ── User Management ─────────────────────────────────────────────────────
  getUsers: asyncHandler(async (req, res) => {
    const result = await adminService.getAllUsers(req.query);
    return ApiResponse.ok(res, result, 'Users retrieved successfully');
  }),

  getUserById: asyncHandler(async (req, res) => {
    const user = await adminService.getUserById(req.params.id);
    return ApiResponse.ok(res, { user }, 'User details retrieved successfully');
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const user = await adminService.updateUserStatus(req.params.id, isActive, req.user._id);
    return ApiResponse.ok(res, { user }, `User status updated to isActive=${user.isActive}`);
  }),

  // ── Item Moderation ─────────────────────────────────────────────────────
  getItems: asyncHandler(async (req, res) => {
    const result = await adminService.getAllItems(req.query);
    return ApiResponse.ok(res, result, 'Items retrieved successfully');
  }),

  getItemById: asyncHandler(async (req, res) => {
    const item = await adminService.getItemById(req.params.id);
    return ApiResponse.ok(res, { item }, 'Item details retrieved successfully');
  }),

  approveItem: asyncHandler(async (req, res) => {
    const item = await adminService.approveItem(req.params.id, req.user._id);
    return ApiResponse.ok(res, { item }, 'Item approved successfully and made publicly visible');
  }),

  rejectItem: asyncHandler(async (req, res) => {
    const { rejectionReason } = req.body;
    const item = await adminService.rejectItem(req.params.id, req.user._id, rejectionReason);
    return ApiResponse.ok(res, { item }, 'Item rejected successfully');
  }),

  // ── Claim Moderation ────────────────────────────────────────────────────
  getClaims: asyncHandler(async (req, res) => {
    const result = await adminService.getAllClaims(req.query);
    return ApiResponse.ok(res, result, 'Claims retrieved successfully');
  }),

  approveClaim: asyncHandler(async (req, res) => {
    const claim = await adminService.approveClaim(req.params.id, req.user._id);
    return ApiResponse.ok(res, { claim }, 'Claim approved and item atomically resolved');
  }),

  rejectClaim: asyncHandler(async (req, res) => {
    const { adminNote } = req.body;
    const claim = await adminService.rejectClaim(req.params.id, req.user._id, adminNote);
    return ApiResponse.ok(res, { claim }, 'Claim rejected successfully');
  }),

  // ── Complaint Reports ───────────────────────────────────────────────────
  getReports: asyncHandler(async (req, res) => {
    const result = await reportService.getReports(req.query);
    return ApiResponse.ok(res, result, 'Reports retrieved successfully');
  }),

  reviewReport: asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body;
    const report = await reportService.reviewReport(req.params.id, req.user._id, { status, adminNote });
    return ApiResponse.ok(res, { report }, 'Report reviewed successfully');
  }),

  // ── Category Management ─────────────────────────────────────────────────
  getCategories: asyncHandler(async (req, res) => {
    const categories = await categoryService.getCategories();
    return ApiResponse.ok(res, { categories }, 'Categories retrieved successfully');
  }),

  createCategory: asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const category = await categoryService.createCategory(req.user._id, { name, description });
    return ApiResponse.created(res, { category }, 'Category created successfully');
  }),

  updateCategory: asyncHandler(async (req, res) => {
    const { name, description, isActive } = req.body;
    const category = await categoryService.updateCategory(req.params.id, req.user._id, {
      name,
      description,
      isActive
    });
    return ApiResponse.ok(res, { category }, 'Category updated successfully');
  }),

  // ── AI Match Review ─────────────────────────────────────────────────────
  getAIMatches: asyncHandler(async (req, res) => {
    const result = await aiMatchService.getAIMatches(req.query);
    return ApiResponse.ok(res, result, 'AI matches retrieved successfully');
  }),

  reviewAIMatch: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const match = await aiMatchService.reviewAIMatch(req.params.id, req.user._id, { status });
    return ApiResponse.ok(res, { match }, 'AI match review recorded');
  }),

  // ── Audit Logs ──────────────────────────────────────────────────────────
  getActivityLogs: asyncHandler(async (req, res) => {
    const result = await activityLogService.getLogs(req.query);
    return ApiResponse.ok(res, result, 'Activity logs retrieved successfully');
  }),

  // ── System Settings ─────────────────────────────────────────────────────
  getSettings: asyncHandler(async (req, res) => {
    const settings = await adminService.getSettings();
    return ApiResponse.ok(res, { settings }, 'System settings retrieved successfully');
  }),

  updateSettings: asyncHandler(async (req, res) => {
    const key = req.params.key || req.body.key;
    const { value, description } = req.body;
    const setting = await adminService.updateSetting(key, value, req.user._id, description);
    return ApiResponse.ok(res, { setting }, `Setting '${key}' updated successfully`);
  })
};

export default adminController;
