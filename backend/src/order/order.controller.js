import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as OrderModel from './order.model.js';
import * as PaymentService from './payment.service.js';
import { getIO, getSocketId } from '../config/socket.js';
import { query } from '../db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache products at startup — avoids fs.readFileSync on every request
const productsPath = path.join(__dirname, 'products.json');
const PRODUCTS = Object.freeze(JSON.parse(fs.readFileSync(productsPath, 'utf8')));

export const getAllProducts = (_req, res) => {
    res.status(200).json({ success: true, products: PRODUCTS });
};

export const getOrderHistory = async (req, res) => {
    try {
        const orders = await OrderModel.getOrdersByUserId(req.user.id);
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Order history error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.getOrderById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Users can only see their own orders; admins see all
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error('Order details error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await OrderModel.getUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        console.error('User profile error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { productId, metadata, slot_id } = req.body;
        const userId = req.user.id; // ALWAYS from token — never from body

        const product = PRODUCTS[productId];
        if (!product) {
            return res.status(400).json({ error: 'Invalid product' });
        }

        // If a slot is requested, validate it exists (actual booking happens at payment success)
        if (slot_id) {
            const slotCheck = await query('SELECT id FROM slots WHERE id = $1 AND is_active = true AND booked < capacity AND slot_time > NOW()', [slot_id]);
            if (!slotCheck.rows[0]) {
                return res.status(409).json({ error: 'Slot is no longer available. Please select another.' });
            }
        }

        if (metadata?.phone) {
            await OrderModel.updateUserPhone(userId, metadata.phone);
        }

        const order = await OrderModel.createOrder({
            user_id: userId,
            product_type: product.type,
            mode: product.mode,
            amount: product.price,
            metadata,
            slot_id: slot_id || null,
        });

        res.status(201).json({ success: true, order });
    } catch (err) {
        console.error('Create order error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getSecurePDF = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await OrderModel.getOrdersByUserId(userId);

        const hasAccess = orders.some(
            (o) => o.product_type === 'book' && o.mode === 'online' && o.status === 'SUCCESS'
        );

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied: Book not purchased or payment pending' });
        }

        const filePath = path.join(__dirname, '..', 'assets', 'guide_2026.pdf');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'PDF file not found' });
        }

        const stat = fs.statSync(filePath);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        console.error('Secure PDF error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const verifyPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.getOrderById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (order.status === 'SUCCESS') {
            return res.json({ success: true, status: 'SUCCESS', message: 'Payment already verified' });
        }

        if (!order.payment_order_id) {
            return res.status(400).json({ error: 'No payment associated with this order' });
        }

        const rpOrder = await PaymentService.fetchRazorpayOrder(order.payment_order_id);

        // Require full amount — not just > 0
        const expectedPaise = Math.round(order.amount * 100);
        if (rpOrder.status === 'paid' && rpOrder.amount_paid >= expectedPaise) {
            await OrderModel.updateOrderStatus(id, 'SUCCESS', {
                payment_order_id: order.payment_order_id,
            });

            await OrderModel.logPaymentHistory({
                order_id: id,
                payment_order_id: order.payment_order_id,
                event: 'manual_verification_success',
                amount: rpOrder.amount_paid / 100,
                status: 'SUCCESS',
                raw_response: rpOrder,
            });

            await query(
                'INSERT INTO order_tracking (order_id, status, message) VALUES ($1, $2, $3)',
                [id, 'ORDER_PLACED', 'Payment verified manually. Order is now active.']
            );

            const io = getIO();
            const socketId = getSocketId(order.user_id);
            if (socketId) {
                io.to(socketId).emit('payment_success', { orderId: id, status: 'SUCCESS' });
            }

            return res.json({ success: true, status: 'SUCCESS', message: 'Payment verified successfully!' });
        }

        res.json({ success: true, status: order.status, message: 'Payment is still pending or not found in gateway.' });
    } catch (err) {
        console.error('Verify payment error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
