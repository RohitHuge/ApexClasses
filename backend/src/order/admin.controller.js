import * as OrderModel from './order.model.js';
import * as AuthModel from '../auth/auth.model.js';
import * as EmailService from '../email/email.service.js';
import { query } from '../db/db.js';

const DELIVERY_PIPELINE = ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await OrderModel.getOrderStatsAdmin();
        res.json({ success: true, stats });
    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const { status, product_type, search } = req.query;
        const orders = await OrderModel.getAllOrdersAdmin({ status, product_type, search });
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Admin orders error:', err.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    const { orderId, status, trackingInfo } = req.body;

    if (!DELIVERY_PIPELINE.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${DELIVERY_PIPELINE.join(', ')}` });
    }

    try {
        const order = await OrderModel.getOrderById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Update metadata with delivery status
        const newMetadata = { ...(order.metadata || {}), delivery_status: status };
        const updatedOrder = await OrderModel.updateOrderMetadataAdmin(orderId, newMetadata);

        // Write to order_tracking for the user-facing timeline
        const messages = {
            PROCESSING: 'Your order is being processed.',
            PACKED: 'Your order has been packed and is ready for dispatch.',
            SHIPPED: `Your book has been shipped.${trackingInfo ? ` Tracking: ${trackingInfo}` : ''}`,
            OUT_FOR_DELIVERY: 'Your order is out for delivery today.',
            DELIVERED: 'Your order has been delivered successfully.',
        };

        await query(
            'INSERT INTO order_tracking (order_id, status, message) VALUES ($1, $2, $3)',
            [orderId, status, messages[status]]
        );

        // Send email on key milestones
        try {
            const userRes = await query('SELECT name, email FROM users WHERE id = $1', [order.user_id]);
            const user = userRes.rows[0];
            if (user) {
                if (status === 'SHIPPED') EmailService.sendBookShippedEmail(user, order, trackingInfo);
                if (status === 'DELIVERED') EmailService.sendBookDeliveredEmail(user, order);
            }
        } catch (emailErr) {
            console.error('Delivery email error:', emailErr.message);
        }

        res.json({ success: true, order: updatedOrder });
    } catch (err) {
        console.error('Admin delivery update error:', err.message);
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await AuthModel.getAllUsers();
        res.json({ success: true, users });
    } catch (err) {
        console.error('Admin users error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role must be "user" or "admin"' });
        }
        // Prevent self-demotion
        if (id === req.user.id && role !== 'admin') {
            return res.status(400).json({ error: 'Cannot demote yourself' });
        }
        const user = await AuthModel.updateUserRole(id, role);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        console.error('Admin update role error:', err.message);
        res.status(500).json({ error: 'Failed to update role' });
    }
};

export const sendMigrationEmails = async (req, res) => {
    try {
        const result = await query(
            `SELECT id, name, email, reset_token FROM users WHERE password IS NULL AND reset_token IS NOT NULL`
        );
        const users = result.rows;
        const frontendUrl = process.env.FRONTEND_URL || 'https://apexclasses.org';

        for (const user of users) {
            const resetUrl = `${frontendUrl}/reset-password?token=${user.reset_token}`;
            await EmailService.sendMigratedUserResetEmail(user, resetUrl);
        }

        res.json({ success: true, sent: users.length });
    } catch (err) {
        console.error('Migration email error:', err.message);
        res.status(500).json({ error: 'Failed to send migration emails' });
    }
};
