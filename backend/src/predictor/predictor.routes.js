import express from 'express';
import * as PredictorController from './predictor.controller.js';
import * as AccountController from './predictor.account.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// ── Public (preview only) — global generalLimiter (app.js) applies ──
router.get('/meta', PredictorController.getMeta);
router.post('/predict', PredictorController.predict);   // 3/3/2 preview + counts
router.post('/lead', PredictorController.captureLead);  // legacy lead capture
router.post('/guest', AccountController.guest);         // phone panel → guest login

// ── Authenticated (account + quota) ──
router.get('/profile', requireAuth, AccountController.profile);
router.post('/reveal', requireAuth, AccountController.reveal);          // full list (consumes quota)
router.get('/searches', requireAuth, AccountController.searches);
router.get('/searches/:id', requireAuth, AccountController.searchDetail);

// ── Payment (₹99 / 15-search pack) ──
router.post('/pay/create', requireAuth, AccountController.payCreate);
router.post('/pay/verify', requireAuth, AccountController.payVerify);

export default router;
