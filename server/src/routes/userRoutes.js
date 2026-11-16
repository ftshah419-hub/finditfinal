import { Router } from 'express';
import userController from '../controllers/userController.js';
import authenticate, { optionalAuthenticate } from '../middlewares/authenticate.js';
import validate from '../middlewares/validate.js';
import { uploadItemImages } from '../middlewares/upload.js';
import {
  createItemValidator,
  updateItemValidator,
  itemIdParamValidator
} from '../validators/itemValidator.js';
import {
  createClaimValidator,
  claimIdParamValidator
} from '../validators/claimValidator.js';

const router = Router();

// ── Public Categories & Search ──────────────────────────────────────────
router.get('/categories', userController.getCategories);
router.get('/search', userController.searchItems);

// ── Profile ─────────────────────────────────────────────────────────────
router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);

// ── Dashboard Statistics (Aggregated Live Metrics) ──────────────────────
router.get('/dashboard-stats', authenticate, userController.getDashboardStats);

// ── Items ───────────────────────────────────────────────────────────────
router.get('/items', authenticate, userController.getMyItems);
router.post('/items', authenticate, uploadItemImages, validate(createItemValidator), userController.createItem);
router.get('/items/:id', optionalAuthenticate, validate(itemIdParamValidator), userController.getItemDetails);
router.patch('/items/:id', authenticate, uploadItemImages, validate(updateItemValidator), userController.updateItem);
router.delete('/items/:id', authenticate, validate(itemIdParamValidator), userController.deleteItem);

// ── Claims ──────────────────────────────────────────────────────────────
router.get('/claims', authenticate, userController.getMyClaims);
router.post('/items/:id/claims', authenticate, uploadItemImages, validate(createClaimValidator), userController.submitClaim);
router.patch('/claims/:id/withdraw', authenticate, validate(claimIdParamValidator), userController.withdrawClaim);

// ── Notifications ───────────────────────────────────────────────────────
router.get('/notifications', authenticate, userController.getMyNotifications);
router.patch('/notifications/:id/read', authenticate, userController.markNotificationRead);

// ── AI Smart Matches for User ───────────────────────────────────────────
router.get('/ai-matches', authenticate, userController.getMyAIMatches);
router.patch('/ai-matches/:id/dismiss', authenticate, userController.dismissAIMatch);

// ── Reports / Complaints ────────────────────────────────────────────────
router.post('/reports', authenticate, userController.submitReport);

export default router;
