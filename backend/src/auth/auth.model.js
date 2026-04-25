import { query } from '../db/db.js';

export const findUserByEmail = async (email) => {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};

export const findUserById = async (id) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};

export const createUser = async ({ name, email, phone, password }) => {
    const res = await query(
        `INSERT INTO users (id, name, email, phone, password, role)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'user')
         RETURNING id, name, email, phone, role, created_at`,
        [name, email, phone || null, password]
    );
    return res.rows[0];
};

export const setRefreshToken = async (userId, token, expires) => {
    await query(
        'UPDATE users SET refresh_token = $2, refresh_token_expires = $3 WHERE id = $1',
        [userId, token, expires]
    );
};

export const clearRefreshToken = async (userId) => {
    await query(
        'UPDATE users SET refresh_token = NULL, refresh_token_expires = NULL WHERE id = $1',
        [userId]
    );
};

export const findUserByRefreshToken = async (token) => {
    const res = await query(
        'SELECT * FROM users WHERE refresh_token = $1 AND refresh_token_expires > NOW()',
        [token]
    );
    return res.rows[0];
};

export const setResetToken = async (email, token, expires) => {
    const res = await query(
        `UPDATE users SET reset_token = $2, reset_token_expires = $3
         WHERE email = $1 RETURNING id`,
        [email, token, expires]
    );
    return res.rows[0];
};

export const findUserByResetToken = async (token) => {
    const res = await query(
        'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
        [token]
    );
    return res.rows[0];
};

export const setPassword = async (userId, password) => {
    await query(
        'UPDATE users SET password = $2, reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
        [userId, password]
    );
};

export const getAllUsers = async () => {
    const res = await query(
        `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
                COUNT(o.id) as order_count,
                COALESCE(SUM(CASE WHEN o.status = 'SUCCESS' THEN o.amount ELSE 0 END), 0) as total_spent
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         GROUP BY u.id
         ORDER BY u.created_at DESC`
    );
    return res.rows;
};

export const updateUserRole = async (userId, role) => {
    const res = await query(
        `UPDATE users SET role = $2 WHERE id = $1
         RETURNING id, name, email, role`,
        [userId, role]
    );
    return res.rows[0];
};
