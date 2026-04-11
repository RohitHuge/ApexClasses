import express from 'express';
import * as OrderController from './order.controller.js';
import * as PaymentController from './payment.controller.js';
import * as AdminController from './admin.controller.js';
import { getOrderTracking } from './tracking.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Product Routes (Public)
router.get('/products', OrderController.getAllProducts);

// Order Routes
router.post('/create', authMiddleware, OrderController.createOrder); // Protected
router.get('/user/profile', authMiddleware, OrderController.getUserProfile); // New
router.get('/', authMiddleware, OrderController.getOrderHistory); // Protected
router.get('/:id', OrderController.getOrderDetails); 
router.post('/:id/verify-payment', authMiddleware, OrderController.verifyPaymentStatus);

// Payment Routes
router.post('/payment/create', authMiddleware, PaymentController.createPaymentOrder); 
router.post('/payment/webhook', PaymentController.handleWebhook); // Public Webhook for Razorpay

// Tracking Routes
router.get('/:id/tracking', getOrderTracking); // Public

// Secure PDF Route
router.get('/secure-pdf/:id', authMiddleware, OrderController.getSecurePDF);

// Admin Management Routes (Nexus-Terminal)
router.get('/admin/stats', adminMiddleware, AdminController.getDashboardStats);
router.get('/admin/all-orders', adminMiddleware, AdminController.getAllOrders);
router.patch('/admin/update-delivery', adminMiddleware, AdminController.updateDeliveryStatus);

export default router;
