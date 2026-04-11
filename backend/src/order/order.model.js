import { query } from '../db/db.js';

export const createOrder = async (orderData) => {
    const { user_id, product_type, mode, amount, metadata } = orderData;
    const sql = `
        INSERT INTO orders (user_id, product_type, mode, amount, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const res = await query(sql, [user_id, product_type, mode, amount, metadata]);
    return res.rows[0];
};

export const getOrderById = async (id) => {
    const res = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return res.rows[0];
};

export const getOrdersByUserId = async (user_id) => {
    const res = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    return res.rows;
};

export const updateOrderStatus = async (id, status, paymentDetails = {}) => {
    const { payment_id, payment_order_id, payment_signature } = paymentDetails;
    const sql = `
        UPDATE orders 
        SET status = $2, 
            payment_id = $3, 
            payment_order_id = $4, 
            payment_signature = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
    `;
    const res = await query(sql, [id, status, payment_id, payment_order_id, payment_signature]);
    return res.rows[0];
};

export const logPaymentHistory = async (historyData) => {
    const { order_id, payment_id, payment_order_id, event, amount, status, raw_response } = historyData;
    const sql = `
        INSERT INTO payment_history (order_id, payment_id, payment_order_id, event, amount, status, raw_response)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const res = await query(sql, [order_id, payment_id, payment_order_id, event, amount, status, raw_response]);
    return res.rows[0];
};

export const getOrderByRPOrderId = async (rpOrderId) => {
    const res = await query('SELECT * FROM orders WHERE payment_order_id = $1', [rpOrderId]);
    return res.rows[0];
};

// USER MANAGEMENT
export const getOrCreateUser = async (userData) => {
    const { id, name, email } = userData;
    // Check if user exists
    const existing = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows[0]) return existing.rows[0];

    // Create if not exists
    const res = await query(
        'INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *',
        [id, name, email]
    );
    return res.rows[0];
};

export const updateUserPhone = async (userId, phone) => {
    const sql = `
        UPDATE users 
        SET phone = $2 
        WHERE id = $1 
        RETURNING *
    `;
    const res = await query(sql, [userId, phone]);
    return res.rows[0];
};

export const getUserById = async (userId) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
    return res.rows[0];
};

// ADMIN QUERIES
export const getAllOrdersAdmin = async () => {
    const sql = `
        SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    `;
    const res = await query(sql);
    return res.rows;
};

export const getOrderStatsAdmin = async () => {
    const sql = `
        SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) as total_revenue,
            COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as success_orders,
            COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_orders,
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders
        FROM orders
    `;
    const res = await query(sql);
    return res.rows[0];
};

export const updateOrderMetadataAdmin = async (id, metadata) => {
    const sql = `
        UPDATE orders 
        SET metadata = $2, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
    `;
    const res = await query(sql, [id, metadata]);
    return res.rows[0];
};
