import express from 'express';
import * as OrderController from './order.controller.js';
import * as PaymentController from './payment.controller.js';
import * as AdminController from './admin.controller.js';
import { getOrderTracking } from './tracking.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { paymentLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// Public
router.get('/products', OrderController.getAllProducts);

// NOTE: /payment/webhook is mounted in app.js BEFORE express.json() to get raw body
// Do NOT add it here

// Auth-required
router.post('/create', requireAuth, OrderController.createOrder);
router.get('/user/profile', requireAuth, OrderController.getUserProfile);
router.get('/', requireAuth, OrderController.getOrderHistory);
router.get('/:id', requireAuth, OrderController.getOrderDetails);
router.post('/:id/verify-payment', requireAuth, OrderController.verifyPaymentStatus);
router.post('/payment/create', requireAuth, paymentLimiter, PaymentController.createPaymentOrder);
router.get('/:id/tracking', requireAuth, getOrderTracking);

// Secure PDF
router.get('/secure-pdf/download', requireAuth, OrderController.getSecurePDF);

// Admin
router.get('/admin/stats', requireAdmin, AdminController.getDashboardStats);
router.get('/admin/all-orders', requireAdmin, AdminController.getAllOrders);
router.patch('/admin/update-delivery', requireAdmin, AdminController.updateDeliveryStatus);
router.get('/admin/users', requireAdmin, AdminController.getAllUsers);
router.patch('/admin/users/:id/role', requireAdmin, AdminController.updateUserRole);
router.post('/admin/send-migration-emails', requireAdmin, AdminController.sendMigrationEmails);

export default router;
