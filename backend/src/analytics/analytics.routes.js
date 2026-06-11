import express from 'express';
import * as AnalyticsController from './analytics.controller.js';

const router = express.Router();

// Public, fire-and-forget, no PII. Behind the global generalLimiter.
router.post('/event', AnalyticsController.capture);
router.get('/summary', AnalyticsController.summary);

export default router;
