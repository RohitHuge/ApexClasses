import express from 'express';
import * as SlotsController from './slots.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// User-facing: available slots for a product
router.get('/', requireAuth, SlotsController.getAvailableSlots);

// Admin slot management
router.get('/admin', requireAdmin, SlotsController.adminGetAllSlots);
router.post('/admin', requireAdmin, SlotsController.adminCreateSlot);
router.patch('/admin/:id', requireAdmin, SlotsController.adminUpdateSlot);
router.delete('/admin/:id', requireAdmin, SlotsController.adminDeleteSlot);

export default router;
