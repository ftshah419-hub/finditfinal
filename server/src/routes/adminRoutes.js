import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

// Enforce both authentication and ADMIN authorization across all routes in this router
router.use(authenticate, authorize('ADMIN'));

// ── Dashboard Metrics ─────────────────────────────────────────────────────
router.get('/dashboard', adminController.getDashboard);

// ── User Management ───────────────────────────────────────────────────────
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/status', adminController.updateUserStatus);

// ── Item Moderation ───────────────────────────────────────────────────────
router.get('/items', adminController.getItems);
router.get('/items/:id', adminController.getItemById);
router.patch('/items/:id/approve', adminController.approveItem);
router.patch('/items/:id/reject', adminController.rejectItem);

// ── Claim Moderation ──────────────────────────────────────────────────────
router.get('/claims', adminController.getClaims);
router.patch('/claims/:id/approve', adminController.approveClaim);
router.patch('/claims/:id/reject', adminController.rejectClaim);

// ── Reports / Complaints Moderation ───────────────────────────────────────
router.get('/reports', adminController.getReports);
router.patch('/reports/:id/review', adminController.reviewReport);

// ── Category Management ───────────────────────────────────────────────────
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);

// ── AI Match Review ───────────────────────────────────────────────────────
router.get('/ai-matches', adminController.getAIMatches);
router.patch('/ai-matches/:id/review', adminController.reviewAIMatch);

// ── Activity Logs / Audit Trail ───────────────────────────────────────────
router.get('/activity-logs', adminController.getActivityLogs);

// ── System Settings ───────────────────────────────────────────────────────
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);
router.patch('/settings/:key', adminController.updateSettings);

export default router;
