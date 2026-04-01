import express from 'express';
import * as OrderController from './order.controller.js';
import * as PaymentController from './payment.controller.js';
import { getOrderTracking } from './tracking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Product Routes (Public)
router.get('/products', OrderController.getAllProducts);

// Order Routes
router.post('/create', authMiddleware, OrderController.createOrder); // Protected
router.get('/user/profile', authMiddleware, OrderController.getUserProfile); // New
router.get('/', authMiddleware, OrderController.getOrderHistory); // Protected
router.get('/:id', OrderController.getOrderDetails); 

// Payment Routes
router.post('/payment/create', authMiddleware, PaymentController.createPaymentOrder); 
router.post('/payment/webhook', PaymentController.handleWebhook); // Public Webhook for Razorpay

// Tracking Routes
router.get('/:id/tracking', getOrderTracking); // Public

export default router;
