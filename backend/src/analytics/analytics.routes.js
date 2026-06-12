import express from 'express';
import * as AnalyticsController from './analytics.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public, fire-and-forget, no PII. Behind the global generalLimiter.
router.post('/event', AnalyticsController.capture);
// Admin only — aggregate event counts.
router.get('/summary', requireAdmin, AnalyticsController.summary);

export default router;
