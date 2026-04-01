import * as OrderModel from './order.model.js';
import { query } from '../db/db.js';
import * as PaymentService from './payment.service.js';
import { getIO, getSocketId } from '../config/socket.js';
import crypto from 'crypto';

export const createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await OrderModel.getOrderById(orderId);
        
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Create Razorpay Order
        const razorpayOrder = await PaymentService.createRazorpayOrder(order.amount, order.id);

        // Update order in DB with RP Order ID
        await OrderModel.updateOrderStatus(order.id, 'PENDING', {
            payment_order_id: razorpayOrder.id
        });

        // Log to payment history
        await OrderModel.logPaymentHistory({
            order_id: order.id,
            payment_order_id: razorpayOrder.id,
            event: 'payment_initiated',
            amount: order.amount,
            status: 'PENDING',
            raw_response: razorpayOrder
        });

        res.status(201).json({ 
            success: true, 
            orderId: order.id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            key: process.env.RAZORPAY_KEY_ID 
        });
    } catch (error) {
        console.error('Create Payment Order Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            console.warn('⚠️ Webhook Signature Mismatch');
            return res.status(400).send('Invalid signature');
        }

        const event = req.body.event;
        const payload = req.body.payload.payment ? req.body.payload.payment.entity : req.body.payload.order.entity;
        
        // Robust Order ID Extraction
        let orderId = payload.notes?.order_id || payload.receipt;
        
        console.log(`🔔 Webhook Event: ${event} Received`);

        // If orderId is still not found, lookup by Razorpay Order ID
        let order;
        if (!orderId && (payload.order_id || payload.id)) {
            const rpOrderId = payload.order_id || payload.id;
            console.log(`🔍 Looking up order by RP Order ID: ${rpOrderId}`);
            order = await OrderModel.getOrderByRPOrderId(rpOrderId);
            if (order) orderId = order.id;
        } else if (orderId) {
            order = await OrderModel.getOrderById(orderId);
        }

        if (!order || !orderId) {
            console.error('❌ Could not identify local order for Razorpay payload:', JSON.stringify(payload));
            return res.status(200).send('Order not found but acknowledged'); // Acknowledge to stop retries
        }

        console.log(`✅ Identified Order: ${orderId} (User: ${order.user_id})`);

        const io = getIO();
        const socketId = getSocketId(order.user_id);

        if (event === 'payment.captured' || event === 'order.paid') {
            // Only update if not already success
            if (order.status !== 'SUCCESS') {
                const updatedOrder = await OrderModel.updateOrderStatus(orderId, 'SUCCESS', {
                    payment_id: payload.id || (payload.payment?.entity?.id),
                    payment_order_id: payload.order_id || payload.id,
                    payment_signature: signature
                });

                // Log history
                await OrderModel.logPaymentHistory({
                    order_id: orderId,
                    payment_id: payload.id,
                    payment_order_id: payload.order_id || payload.id,
                    event: event,
                    amount: (payload.amount || payload.amount_paid) / 100,
                    status: 'SUCCESS',
                    raw_response: req.body
                });

                // Add tracking
                await query('INSERT INTO order_tracking (order_id, status, message) VALUES ($1, $2, $3)', [
                    orderId, 'ORDER_PLACED', 'Your payment was successful and order is placed.'
                ]);

                // Notify Frontend via WebSocket
                if (socketId) {
                    io.to(socketId).emit('payment_success', {
                        orderId,
                        status: 'SUCCESS',
                        message: 'Payment verified successfully'
                    });
                }
            }
        } else if (event === 'payment.failed') {
            await OrderModel.updateOrderStatus(orderId, 'FAILED', {
                payment_id: payload.id
            });

            // Log history
            await OrderModel.logPaymentHistory({
                order_id: orderId,
                payment_id: payload.id,
                payment_order_id: payload.order_id,
                event: 'payment.failed',
                amount: payload.amount / 100,
                status: 'FAILED',
                raw_response: req.body
            });

            // Notify Frontend
            if (socketId) {
                io.to(socketId).emit('payment_failed', {
                    orderId,
                    status: 'FAILED',
                    error: payload.error_description
                });
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
