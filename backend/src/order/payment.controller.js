import crypto from 'crypto';
import * as OrderModel from './order.model.js';
import * as PaymentService from './payment.service.js';
import * as SlotsModel from '../slots/slots.model.js';
import * as EmailService from '../email/email.service.js';
import { getIO, getSocketId } from '../config/socket.js';
import { query } from '../db/db.js';
import pool from '../db/db.js';

export const createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await OrderModel.getOrderById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Only the owning user can initiate payment
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const razorpayOrder = await PaymentService.createRazorpayOrder(order.amount, order.id);

        await OrderModel.updateOrderStatus(order.id, 'PENDING', {
            payment_order_id: razorpayOrder.id,
        });

        await OrderModel.logPaymentHistory({
            order_id: order.id,
            payment_order_id: razorpayOrder.id,
            event: 'payment_initiated',
            amount: order.amount,
            status: 'PENDING',
            raw_response: razorpayOrder,
        });

        res.status(201).json({
            success: true,
            orderId: order.id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('Create payment order error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const handleWebhook = async (req, res) => {
    // req.body is a raw Buffer here (see app.js webhook route)
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const digest = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (digest !== signature) {
        console.warn('⚠️ Webhook signature mismatch');
        return res.status(400).send('Invalid signature');
    }

    let body;
    try {
        body = JSON.parse(req.body.toString());
    } catch {
        return res.status(400).send('Invalid JSON body');
    }

    const event = body.event;
    const paymentEntity = body.payload?.payment?.entity;
    const orderEntity = body.payload?.order?.entity;
    const payload = paymentEntity || orderEntity;

    if (!payload) {
        console.warn('⚠️ Webhook: no payload entity found');
        return res.status(200).send('OK');
    }

    let orderId = payload.notes?.order_id || payload.receipt;
    let order;

    if (!orderId) {
        const rpOrderId = payload.order_id || payload.id;
        if (rpOrderId) order = await OrderModel.getOrderByRPOrderId(rpOrderId);
        if (order) orderId = order.id;
    } else {
        order = await OrderModel.getOrderById(orderId);
    }

    if (!order || !orderId) {
        console.error('⚠️ Webhook: could not identify local order for payload', JSON.stringify(payload));
        return res.status(200).send('Order not found — acknowledged');
    }

    console.log(`🔔 Webhook: ${event} — Order ${orderId} (User: ${order.user_id})`);

    const io = getIO();
    const socketId = getSocketId(order.user_id);

    if (event === 'payment.captured' || event === 'order.paid') {
        if (order.status === 'SUCCESS') {
            return res.status(200).send('OK');
        }

        // All three writes in one transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `UPDATE orders SET status = 'SUCCESS', payment_id = $2, payment_order_id = $3, payment_signature = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [orderId, paymentEntity?.id || null, payload.order_id || payload.id, signature]
            );

            await client.query(
                `INSERT INTO payment_history (order_id, payment_id, payment_order_id, event, amount, status, raw_response)
                 VALUES ($1, $2, $3, $4, $5, 'SUCCESS', $6)`,
                [
                    orderId,
                    paymentEntity?.id || null,
                    payload.order_id || payload.id,
                    event,
                    (payload.amount || payload.amount_paid || 0) / 100,
                    body,
                ]
            );

            await client.query(
                `INSERT INTO order_tracking (order_id, status, message) VALUES ($1, 'ORDER_PLACED', 'Payment successful — order confirmed.')`,
                [orderId]
            );

            // Atomically book the slot if one was reserved
            if (order.slot_id) {
                const slotBooked = await client.query(
                    `UPDATE slots SET booked = booked + 1
                     WHERE id = $1 AND is_active = true AND booked < capacity
                     RETURNING id`,
                    [order.slot_id]
                );
                if (!slotBooked.rows[0]) {
                    // Slot is full — still complete order but clear slot_id and log it
                    await client.query(`UPDATE orders SET slot_id = NULL WHERE id = $1`, [orderId]);
                    await client.query(
                        `INSERT INTO order_tracking (order_id, status, message) VALUES ($1, 'SLOT_CONFLICT', 'Requested slot was full. Admin will assign an alternative.')`,
                        [orderId]
                    );
                }
            }

            await client.query('COMMIT');
        } catch (txErr) {
            await client.query('ROLLBACK');
            console.error('Webhook transaction failed:', txErr.message);
            return res.status(500).send('Internal Server Error');
        } finally {
            client.release();
        }

        // Post-payment: send confirmation email (non-blocking)
        try {
            const userRes = await query('SELECT name, email FROM users WHERE id = $1', [order.user_id]);
            const user = userRes.rows[0];
            if (user) EmailService.sendOrderConfirmationEmail(user, order, null);
        } catch (emailErr) {
            console.error('Post-payment email error:', emailErr.message);
        }

        if (socketId) {
            io.to(socketId).emit('payment_success', { orderId, status: 'SUCCESS', message: 'Payment verified successfully' });
        }

    } else if (event === 'payment.failed') {
        await OrderModel.updateOrderStatus(orderId, 'FAILED', { payment_id: paymentEntity?.id });

        await OrderModel.logPaymentHistory({
            order_id: orderId,
            payment_id: paymentEntity?.id,
            payment_order_id: payload.order_id,
            event: 'payment.failed',
            amount: (payload.amount || 0) / 100,
            status: 'FAILED',
            raw_response: body,
        });

        if (socketId) {
            io.to(socketId).emit('payment_failed', {
                orderId,
                status: 'FAILED',
                error: paymentEntity?.error_description || 'Payment failed',
            });
        }
    }

    res.status(200).send('OK');
};
