import * as orderModel from './order.model.js';

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await orderModel.getOrderStatsAdmin();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Admin Stats Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrdersAdmin();
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Admin Orders Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch system orders' });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    const { orderId, status } = req.body;
    try {
        const order = await orderModel.getOrderById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const newMetadata = {
            ...(order.metadata || {}),
            delivery_status: status
        };

        const updatedOrder = await orderModel.updateOrderMetadataAdmin(orderId, newMetadata);
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Admin Update Status Error:', error.message);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
