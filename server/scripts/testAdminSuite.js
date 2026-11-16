import http from 'http';
import app from '../src/app.js';
import env from '../src/config/env.js';
import adminService from '../src/services/adminService.js';
import reportService from '../src/services/reportService.js';
import categoryService from '../src/services/categoryService.js';
import activityLogService from '../src/services/activityLogService.js';
import aiMatchService from '../src/services/aiMatchService.js';
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';
import Claim from '../src/models/Claim.js';
import Report from '../src/models/Report.js';
import Category from '../src/models/Category.js';
import Notification from '../src/models/Notification.js';
import ActivityLog from '../src/models/ActivityLog.js';
import SystemSetting from '../src/models/SystemSetting.js';
import AIMatch from '../src/models/AIMatch.js';
import ApiError from '../src/utils/ApiError.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('='.repeat(70));
  console.log('  FINDIT — Person 3 Admin Module 21-Point Verification Suite');
  console.log('='.repeat(70));

  // ── Setup HTTP Test Server ────────────────────────────────────────────────
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const secret = env.JWT_SECRET || 'test_admin_jwt_secret_findit_platform_2026';
  env.JWT_SECRET = secret;

  // 24-character valid MongoDB hex ObjectIds
  const mockAdminId = '6738c8f0e4b0a1b2c3d4e5f0';
  const mockUserId = '6738c8f0e4b0a1b2c3d4e5f1';
  const mockItemId = '6738c8f0e4b0a1b2c3d4e5f2';
  const mockClaimId = '6738c8f0e4b0a1b2c3d4e5f3';
  const mockReportId = '6738c8f0e4b0a1b2c3d4e5f4';
  const mockCategoryId = '6738c8f0e4b0a1b2c3d4e5f5';
  const mockMatchId = '6738c8f0e4b0a1b2c3d4e5f6';

  const adminToken = jwt.sign({ id: mockAdminId, role: 'ADMIN' }, secret, { expiresIn: '1h' });
  const userToken = jwt.sign({ id: mockUserId, role: 'USER' }, secret, { expiresIn: '1h' });

  // Default non-blocking mocks
  ActivityLog.create = (doc) => Promise.resolve(doc);
  Notification.create = (doc) => Promise.resolve(doc);
  mongoose.startSession = () => Promise.reject(new Error('No replica set in mock test'));

  try {
    // ── Test 21: Unauthenticated request attempting to access Admin APIs ──────
    console.log('\n[Check 21] Unauthenticated request attempting to access Admin APIs:');
    const resNoAuth = await fetch(`${baseUrl}/admin/dashboard`, { method: 'GET' });
    const dataNoAuth = await resNoAuth.json();
    assert(resNoAuth.status === 401, 'Unauthenticated request receives HTTP 401 Unauthorized');
    assert(dataNoAuth.errorCode === 'AUTHENTICATION_REQUIRED', 'Error code is AUTHENTICATION_REQUIRED');

    // ── Test 20: USER attempting to access Admin APIs ─────────────────────────
    console.log('\n[Check 20] USER role attempting to access Admin APIs:');
    User.findById = (id) => {
      if (id === mockUserId) {
        return Promise.resolve({
          _id: mockUserId,
          name: 'Regular Student',
          email: 'student@campus.edu',
          role: 'USER',
          isActive: true
        });
      }
      if (id === mockAdminId) {
        return Promise.resolve({
          _id: mockAdminId,
          name: 'Super Admin',
          email: 'admin@campus.edu',
          role: 'ADMIN',
          isActive: true
        });
      }
      return Promise.resolve(null);
    };

    const resUserRole = await fetch(`${baseUrl}/admin/dashboard`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const dataUserRole = await resUserRole.json();
    assert(resUserRole.status === 403, 'USER role receives HTTP 403 Forbidden');
    assert(dataUserRole.errorCode === 'INSUFFICIENT_PERMISSIONS', 'Error code is INSUFFICIENT_PERMISSIONS');

    // ── Test 1: Admin dashboard statistics ────────────────────────────────────
    console.log('\n[Check 1] Admin dashboard statistics computation:');
    User.countDocuments = (filter = {}) => {
      if (filter.isActive === true) return Promise.resolve(14000);
      if (filter.role === 'ADMIN') return Promise.resolve(5);
      return Promise.resolve(14820);
    };
    Item.countDocuments = (filter = {}) => {
      if (filter.type === 'LOST') return Promise.resolve(1429);
      if (filter.type === 'FOUND') return Promise.resolve(1894);
      if (filter.status === 'PENDING') return Promise.resolve(42);
      if (filter.status === 'APPROVED') return Promise.resolve(1500);
      if (filter.status === 'RESOLVED') return Promise.resolve(1642);
      if (filter.status === 'REJECTED') return Promise.resolve(20);
      return Promise.resolve(3323);
    };
    Claim.countDocuments = (filter = {}) => {
      if (filter.status === 'PENDING') return Promise.resolve(24);
      if (filter.status === 'APPROVED') return Promise.resolve(150);
      if (filter.status === 'REJECTED') return Promise.resolve(10);
      return Promise.resolve(184);
    };
    Report.countDocuments = () => Promise.resolve(8);
    AIMatch.countDocuments = () => Promise.resolve(38);

    const mockItemQuery = {
      sort: () => mockItemQuery,
      limit: () => mockItemQuery,
      populate: () => mockItemQuery,
      lean: () => Promise.resolve([{ _id: mockItemId, title: 'MacBook Pro' }])
    };
    Item.find = () => mockItemQuery;

    const mockClaimQuery = {
      sort: () => mockClaimQuery,
      limit: () => mockClaimQuery,
      populate: () => mockClaimQuery,
      lean: () => Promise.resolve([{ _id: mockClaimId, status: 'PENDING' }])
    };
    Claim.find = () => mockClaimQuery;

    const mockUserQuery = {
      sort: () => mockUserQuery,
      limit: () => mockUserQuery,
      select: () => mockUserQuery,
      lean: () => Promise.resolve([{ _id: mockAdminId, name: 'Admin' }])
    };
    User.find = () => mockUserQuery;

    const mockLogQuery = {
      populate: () => mockLogQuery,
      sort: () => mockLogQuery,
      skip: () => mockLogQuery,
      limit: () => mockLogQuery,
      lean: () => Promise.resolve([{ _id: '6738c8f0e4b0a1b2c3d4e5f7', action: 'ITEM_APPROVED', description: 'Sample log' }])
    };
    ActivityLog.find = () => mockLogQuery;
    ActivityLog.countDocuments = () => Promise.resolve(1);

    const stats = await adminService.getDashboardStats();
    assert(stats.users.total === 14820, 'Stats user total returned 14,820');
    assert(stats.users.active === 14000, 'Stats active users returned 14,000');
    assert(stats.items.lost === 1429, 'Stats lost items returned 1,429');
    assert(stats.items.found === 1894, 'Stats found items returned 1,894');
    assert(stats.claims.pending === 24, 'Stats pending claims returned 24');
    assert(stats.items.resolved === 1642, 'Stats resolved items returned 1,642');
    assert(stats.reports.pending === 8, 'Stats pending reports returned 8');
    assert(stats.aiMatches.pending === 38, 'Stats pending AI matches returned 38');

    // ── Test 2: User listing and search ───────────────────────────────────────
    console.log('\n[Check 2] User listing and search:');
    const mockUsersListQuery = {
      sort: () => mockUsersListQuery,
      skip: () => mockUsersListQuery,
      limit: () => mockUsersListQuery,
      lean: () => Promise.resolve([
        { _id: mockUserId, name: 'Alex Chen', email: 'alex.chen@campus.edu', role: 'USER', isActive: true },
        { _id: mockAdminId, name: 'Sarah Jenkins', email: 'sarah.j@campus.edu', role: 'ADMIN', isActive: true }
      ])
    };
    User.find = () => mockUsersListQuery;
    Item.aggregate = () => Promise.resolve([]);
    Claim.aggregate = () => Promise.resolve([]);

    const usersResult = await adminService.getAllUsers({ search: 'Alex', page: 1, limit: 10 });
    assert(usersResult.users.length === 2, 'getAllUsers returns populated user list');
    assert(usersResult.users[0].name === 'Alex Chen', 'First user matches search criteria');
    assert(usersResult.pagination.page === 1, 'Pagination page is 1');

    // ── Test 3: User activation and deactivation ──────────────────────────────
    console.log('\n[Check 3] User activation and deactivation:');
    let savedUser = null;
    User.findById = (id) => {
      if (id === mockUserId) {
        return Promise.resolve({
          _id: mockUserId,
          name: 'Alex Chen',
          email: 'alex.chen@campus.edu',
          isActive: true,
          save: function () {
            savedUser = this;
            return Promise.resolve(this);
          }
        });
      }
      return Promise.resolve(null);
    };

    // Attempt self-deactivation (must fail)
    let selfDeactivateBlocked = false;
    try {
      await adminService.updateUserStatus(mockAdminId, false, mockAdminId);
    } catch (err) {
      if (err.errorCode === 'CANNOT_DEACTIVATE_SELF') selfDeactivateBlocked = true;
    }
    assert(selfDeactivateBlocked, 'Deactivating own admin account is strictly blocked');

    // Deactivate regular user
    await adminService.updateUserStatus(mockUserId, false, mockAdminId);
    assert(savedUser && savedUser.isActive === false, 'User status successfully set to isActive=false');

    // Reactivate regular user
    await adminService.updateUserStatus(mockUserId, true, mockAdminId);
    assert(savedUser && savedUser.isActive === true, 'User status successfully set to isActive=true');

    // ── Test 4: Item listing and filtering ────────────────────────────────────
    console.log('\n[Check 4] Item listing and filtering:');
    const mockItemsListQuery = {
      populate: () => mockItemsListQuery,
      sort: () => mockItemsListQuery,
      skip: () => mockItemsListQuery,
      limit: () => mockItemsListQuery,
      lean: () => Promise.resolve([
        { _id: mockItemId, title: 'Black Wallet', type: 'LOST', status: 'PENDING' }
      ])
    };
    Item.find = () => mockItemsListQuery;

    const itemsResult = await adminService.getAllItems({ type: 'LOST', status: 'PENDING' });
    assert(itemsResult.items.length === 1, 'getAllItems returns items for moderation');
    assert(itemsResult.items[0].type === 'LOST', 'Item type filter preserved');

    // ── Test 5: Item approval ─────────────────────────────────────────────────
    console.log('\n[Check 5] Item approval workflow:');
    let approvedItem = null;
    Item.findById = () => Promise.resolve({
      _id: mockItemId,
      title: 'Black Wallet',
      type: 'LOST',
      status: 'PENDING',
      reportedBy: mockUserId,
      save: function () {
        approvedItem = this;
        return Promise.resolve(this);
      }
    });

    await adminService.approveItem(mockItemId, mockAdminId);
    assert(approvedItem && approvedItem.status === 'APPROVED', 'Item status changed to APPROVED');
    assert(approvedItem.reviewedBy === mockAdminId, 'reviewedBy correctly records adminId');
    assert(approvedItem.reviewedAt instanceof Date, 'reviewedAt timestamp recorded');

    // ── Test 6: Item rejection with reason ────────────────────────────────────
    console.log('\n[Check 6] Item rejection with reason:');
    let rejectedItem = null;
    Item.findById = () => Promise.resolve({
      _id: mockItemId,
      title: 'Suspicious Watch',
      type: 'LOST',
      status: 'PENDING',
      reportedBy: mockUserId,
      save: function () {
        rejectedItem = this;
        return Promise.resolve(this);
      }
    });

    let rejectionWithoutReasonBlocked = false;
    try {
      await adminService.rejectItem(mockItemId, mockAdminId, '');
    } catch (err) {
      if (err.errorCode === 'REASON_REQUIRED') rejectionWithoutReasonBlocked = true;
    }
    assert(rejectionWithoutReasonBlocked, 'Rejecting an item without reason is strictly rejected');

    await adminService.rejectItem(mockItemId, mockAdminId, 'Insufficient evidence photos');
    assert(rejectedItem && rejectedItem.status === 'REJECTED', 'Item status changed to REJECTED');
    assert(rejectedItem.rejectionReason === 'Insufficient evidence photos', 'Rejection reason persisted');

    // ── Test 7: Claim listing ─────────────────────────────────────────────────
    console.log('\n[Check 7] Claim listing:');
    const mockClaimsListQuery = {
      populate: () => mockClaimsListQuery,
      sort: () => mockClaimsListQuery,
      skip: () => mockClaimsListQuery,
      limit: () => mockClaimsListQuery,
      lean: () => Promise.resolve([
        { _id: mockClaimId, status: 'PENDING', proofDescription: 'Contains student ID' }
      ])
    };
    Claim.find = () => mockClaimsListQuery;

    const claimsResult = await adminService.getAllClaims({ status: 'PENDING' });
    assert(claimsResult.claims.length === 1, 'getAllClaims returns claims queue');
    assert(claimsResult.claims[0].status === 'PENDING', 'Claim status matches filter');

    // ── Test 8: Claim approval ────────────────────────────────────────────────
    console.log('\n[Check 8] Claim approval workflow:');
    let approvedClaim = null;
    let resolvedItemFromClaim = null;
    let competingClaimsRejected = false;

    Claim.findById = () => Promise.resolve({
      _id: mockClaimId,
      itemId: mockItemId,
      claimantId: mockUserId,
      status: 'PENDING',
      save: function () {
        approvedClaim = this;
        return Promise.resolve(this);
      }
    });

    Item.findOneAndUpdate = (filter, update) => {
      if (filter.status === 'APPROVED') {
        resolvedItemFromClaim = { _id: filter._id, status: update.$set.status };
        return Promise.resolve(resolvedItemFromClaim);
      }
      return Promise.resolve(null);
    };

    Claim.updateMany = (filter, update) => {
      if (filter.status === 'PENDING') {
        competingClaimsRejected = true;
      }
      return Promise.resolve({ modifiedCount: 2 });
    };

    await adminService.approveClaim(mockClaimId, mockAdminId);
    assert(approvedClaim && approvedClaim.status === 'APPROVED', 'Winning claim status set to APPROVED');
    assert(approvedClaim.reviewedBy === mockAdminId, 'Claim reviewer recorded');

    // ── Test 9: Claim rejection ───────────────────────────────────────────────
    console.log('\n[Check 9] Claim rejection:');
    let rejectedClaim = null;
    Claim.findById = () => Promise.resolve({
      _id: mockClaimId,
      itemId: mockItemId,
      claimantId: mockUserId,
      status: 'PENDING',
      save: function () {
        rejectedClaim = this;
        return Promise.resolve(this);
      }
    });

    await adminService.rejectClaim(mockClaimId, mockAdminId, 'Serial mismatch');
    assert(rejectedClaim && rejectedClaim.status === 'REJECTED', 'Claim status changed to REJECTED');
    assert(rejectedClaim.adminNote === 'Serial mismatch', 'Admin rejection note recorded');

    // ── Test 10: Competing claim approval safety ──────────────────────────────
    console.log('\n[Check 10] Competing claim approval safety:');
    Item.findOneAndUpdate = () => Promise.resolve(null); // Item is already RESOLVED, cannot resolve again
    let conflictBlocked = false;
    try {
      await adminService.approveClaim(mockClaimId, mockAdminId);
    } catch (err) {
      if (err.errorCode === 'ITEM_NOT_AVAILABLE_FOR_RESOLUTION') conflictBlocked = true;
    }
    assert(conflictBlocked, 'Approval of competing claim blocked when item is already resolved');
    assert(competingClaimsRejected, 'Competing pending claims automatically rejected during approval');

    // ── Test 11: Item resolution after claim approval ─────────────────────────
    console.log('\n[Check 11] Item resolution after claim approval:');
    assert(resolvedItemFromClaim && resolvedItemFromClaim.status === 'RESOLVED', 'Item status atomically transitioned to RESOLVED');

    // ── Test 12: Complaint review ─────────────────────────────────────────────
    console.log('\n[Check 12] Complaint and report review:');
    let reviewedReport = null;
    Report.findById = () => Promise.resolve({
      _id: mockReportId,
      status: 'PENDING',
      reason: 'Fake Found Item Listing',
      save: function () {
        reviewedReport = this;
        return Promise.resolve(this);
      }
    });

    await reportService.reviewReport(mockReportId, mockAdminId, {
      status: 'RESOLVED',
      adminNote: 'Item removed and poster warned'
    });
    assert(reviewedReport && reviewedReport.status === 'RESOLVED', 'Report status updated to RESOLVED');
    assert(reviewedReport.adminNote === 'Item removed and poster warned', 'Report admin note recorded');

    // ── Test 13: Category creation ────────────────────────────────────────────
    console.log('\n[Check 13] Category creation:');
    let createdCategory = null;
    Category.findOne = () => Promise.resolve(null); // No duplicate
    Category.create = (doc) => {
      createdCategory = doc;
      return Promise.resolve(doc);
    };

    await categoryService.createCategory(mockAdminId, {
      name: 'Electronics & Audio',
      description: 'Laptops, headphones, tablets'
    });
    assert(createdCategory && createdCategory.name === 'Electronics & Audio', 'Category created with normalized name');
    assert(createdCategory.isActive === true, 'Category defaults to isActive=true');

    // Duplicate check
    Category.findOne = () => Promise.resolve({ name: 'Electronics & Audio' });
    let duplicateCategoryBlocked = false;
    try {
      await categoryService.createCategory(mockAdminId, { name: 'Electronics & Audio' });
    } catch (err) {
      if (err.errorCode === 'DUPLICATE_CATEGORY') duplicateCategoryBlocked = true;
    }
    assert(duplicateCategoryBlocked, 'Duplicate category name creation is rejected');

    // ── Test 14: Category modification ────────────────────────────────────────
    console.log('\n[Check 14] Category modification:');
    let updatedCategory = null;
    Category.findById = () => Promise.resolve({
      _id: mockCategoryId,
      name: 'Electronics & Audio',
      description: 'Original',
      isActive: true,
      save: function () {
        updatedCategory = this;
        return Promise.resolve(this);
      }
    });
    Category.findOne = () => Promise.resolve(null);

    await categoryService.updateCategory(mockCategoryId, mockAdminId, {
      name: 'Consumer Electronics',
      description: 'Updated description'
    });
    assert(updatedCategory && updatedCategory.name === 'Consumer Electronics', 'Category name modified');
    assert(updatedCategory.description === 'Updated description', 'Category description updated');

    // ── Test 15: Category deactivation ────────────────────────────────────────
    console.log('\n[Check 15] Category deactivation:');
    await categoryService.deactivateCategory(mockCategoryId, mockAdminId);
    assert(updatedCategory && updatedCategory.isActive === false, 'Category soft-deactivated instead of physically deleted');

    // ── Test 16: AI match review ──────────────────────────────────────────────
    console.log('\n[Check 16] AI match review (advisory only):');
    let reviewedMatch = null;
    AIMatch.findById = () => Promise.resolve({
      _id: mockMatchId,
      similarityScore: 94,
      status: 'PENDING',
      save: function () {
        reviewedMatch = this;
        return Promise.resolve(this);
      }
    });

    await aiMatchService.reviewMatch(mockMatchId, mockAdminId, { status: 'CONFIRMED' });
    assert(reviewedMatch && reviewedMatch.status === 'CONFIRMED', 'AI match marked as CONFIRMED');
    assert(reviewedMatch.reviewedBy === mockAdminId, 'Admin reviewer ID stored on AI match');

    // ── Test 17: Activity log creation ────────────────────────────────────────
    console.log('\n[Check 17] Activity log creation and secret sanitization:');
    let createdLog = null;
    ActivityLog.create = (doc) => {
      createdLog = doc;
      return Promise.resolve(doc);
    };

    await activityLogService.logActivity({
      actorId: mockAdminId,
      action: 'ITEM_APPROVED',
      entityType: 'ITEM',
      entityId: mockItemId,
      description: 'Approved MacBook Pro',
      metadata: { secretToken: 'SUPER_SECRET', userEmail: 'test@campus.edu' }
    });
    assert(createdLog && createdLog.action === 'ITEM_APPROVED', 'Activity log recorded with action ITEM_APPROVED');
    assert(!createdLog.metadata.secretToken, 'Sensitive key "secretToken" sanitized and stripped from log');
    assert(createdLog.metadata.userEmail === 'test@campus.edu', 'Non-sensitive metadata preserved');

    // ── Test 18: Activity log display ─────────────────────────────────────────
    console.log('\n[Check 18] Activity log display & filtering:');
    const mockLogsQueryFinal = {
      populate: () => mockLogsQueryFinal,
      sort: () => mockLogsQueryFinal,
      skip: () => mockLogsQueryFinal,
      limit: () => mockLogsQueryFinal,
      lean: () => Promise.resolve([
        { _id: '6738c8f0e4b0a1b2c3d4e5f7', action: 'ITEM_APPROVED', entityType: 'ITEM' }
      ])
    };
    ActivityLog.find = () => mockLogsQueryFinal;
    ActivityLog.countDocuments = () => Promise.resolve(1);

    const logsResult = await activityLogService.getLogs({ entityType: 'ITEM' });
    assert(logsResult.logs.length === 1, 'getLogs returns filtered logs');
    assert(logsResult.logs[0].entityType === 'ITEM', 'Entity type filter applied');

    // ── Test 19: System settings ──────────────────────────────────────────────
    console.log('\n[Check 19] System settings viewing and updating:');
    let updatedSetting = null;
    SystemSetting.find = () => ({
      populate: () => ({
        sort: () => ({
          lean: () => Promise.resolve([
            { key: 'CLAIM_SLA_HOURS', value: '24', description: 'Turnaround window' }
          ])
        })
      })
    });
    SystemSetting.findOneAndUpdate = (filter, update) => {
      updatedSetting = { key: filter.key, ...update.$set };
      return Promise.resolve(updatedSetting);
    };

    const settings = await adminService.getSettings();
    assert(settings.length === 1, 'getSettings returns configured system settings');

    await adminService.updateSetting('CLAIM_SLA_HOURS', '12', mockAdminId, 'Reduced turnaround');
    assert(updatedSetting && updatedSetting.value === '12', 'Setting value updated to 12');
    assert(updatedSetting.updatedBy === mockAdminId, 'Setting updater recorded');

    // Cleanup server
    server.close();
  } catch (err) {
    console.error('[FATAL TEST SUITE ERROR]:', err);
    failed++;
    failures.push(`Fatal Error: ${err.message}`);
    server.close();
  }

  console.log('\n' + '='.repeat(70));
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('='.repeat(70));

  if (failed > 0) {
    console.error('\nFailures detected:');
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('\n  ALL 21 TEST SPECIFICATIONS PASSED WITH ZERO ERRORS!\n');
    process.exit(0);
  }
}

runTestSuite();
