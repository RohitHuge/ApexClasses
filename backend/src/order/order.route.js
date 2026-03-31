import express from 'express';
import * as OrderController from './order.controller.js';
import * as PaymentController from './payment.controller.js';
import { getOrderTracking } from './tracking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Product Routes (Public)
router.get('/products', OrderController.getAllProducts);

// Order Routes
router.post('/create', OrderController.createOrder); // Public
router.get('/', authMiddleware, OrderController.getOrderHistory); // Protected
router.get('/:id', OrderController.getOrderDetails); // Public-ish (detailed view)

// Payment Routes
router.post('/payment/create', authMiddleware, PaymentController.createPayment); // Protected
router.post('/payment/verify', authMiddleware, PaymentController.verifyPayment); // Protected

// Tracking Routes
router.get('/:id/tracking', getOrderTracking); // Public

export default router;
