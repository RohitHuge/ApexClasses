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
