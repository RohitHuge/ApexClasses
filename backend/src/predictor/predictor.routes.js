import express from 'express';
import * as PredictorController from './predictor.controller.js';
import * as AccountController from './predictor.account.controller.js';
import * as RankController from './predictor.rank.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// ── Percentile predictor — public ───────────────────────────────────────────
router.get('/meta', PredictorController.getMeta);
router.post('/predict', PredictorController.predict);   // 3/3/2 preview + counts
router.post('/lead', PredictorController.captureLead);  // legacy lead capture
router.post('/guest', AccountController.guest);               // legacy: phone+name guest login
router.post('/shadow-guest', AccountController.shadowGuest);  // phone-only shadow account
router.post('/shadow-refresh', AccountController.shadowRefresh); // device-bound token refresh

// ── Percentile predictor — authenticated ────────────────────────────────────
router.get('/profile', requireAuth, AccountController.profile);
router.post('/reveal', requireAuth, AccountController.reveal);
router.get('/searches', requireAuth, AccountController.searches);
router.get('/searches/:id', requireAuth, AccountController.searchDetail);

// ── Percentile predictor — payment (₹89 / 15-search pack) ──────────────────
router.post('/pay/create', requireAuth, AccountController.payCreate);
router.post('/pay/verify', requireAuth, AccountController.payVerify);

// ── Rank predictor — public ──────────────────────────────────────────────────
router.get('/rank/meta', RankController.rankMeta);
router.post('/rank/predict', RankController.rankPredict);   // 3/3/2 preview + counts

// ── Rank predictor — authenticated ──────────────────────────────────────────
router.post('/rank/reveal', requireAuth, RankController.rankReveal);

// ── Rank predictor — payment (₹200 / 15-search pack) ────────────────────────
router.post('/rank/pay/create', requireAuth, RankController.rankPayCreate);
router.post('/rank/pay/verify', requireAuth, RankController.rankPayVerify);

// ── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/stats', requireAdmin, AccountController.adminStats);

export default router;
