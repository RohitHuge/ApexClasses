import * as OrderModel from './order.model.js';
import { query } from '../db/db.js';

export const createPayment = async (req, res) => {
    try {
        const { order_id } = req.body;
        const order = await OrderModel.getOrderById(order_id);
        
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Simulate Razorpay Order Creation
        const mockRPOrder = {
            id: `order_rp_${Math.random().toString(36).substr(2, 9)}`,
            amount: order.amount * 100, // in paise
            currency: 'INR',
        };

        res.status(201).json({ success: true, payment_order: mockRPOrder });
    } catch (error) {
        console.error('Create Payment Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { order_id, payment_id, payment_order_id, payment_signature } = req.body;
        
        // Mock verification
        const isValid = true; // In real, verify HMAC(payment_order_id + "|" + payment_id, secret) == payment_signature

        if (isValid) {
            const updatedOrder = await OrderModel.updateOrderStatus(order_id, 'SUCCESS', {
                payment_id,
                payment_order_id,
                payment_signature
            });
            
            // Add tracking entry
            await query('INSERT INTO order_tracking (order_id, status, message) VALUES ($1, $2, $3)', [
                order_id, 'ORDER_PLACED', 'Your order has been placed successfully.'
            ]);

            res.status(200).json({ success: true, order: updatedOrder });
        } else {
            res.status(400).json({ success: false, error: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
