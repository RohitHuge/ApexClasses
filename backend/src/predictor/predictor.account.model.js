import { query } from '../db/db.js';

// ── Users / accounts ─────────────────────────────────────────────────────────

// All users sharing a phone (phone is not unique in `users`). Used to decide
// guest-reuse vs "account exists, please log in".
export const findUsersByPhone = async (phone) => {
    const res = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    return res.rows;
};

// A password-less "guest" account created from the predictor lead panel.
export const createGuestUser = async ({ name, phone }) => {
    const res = await query(
        `INSERT INTO users (id, name, phone, role)
         VALUES (gen_random_uuid()::text, $1, $2, 'user')
         RETURNING id, name, email, phone, role`,
        [name, phone || null]
    );
    return res.rows[0];
};

// ── Entitlement profile ──────────────────────────────────────────────────────

export const getOrCreateProfile = async (userId) => {
    const res = await query(
        `INSERT INTO predictor_profiles (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
         RETURNING user_id, plan, searches_limit, searches_used`,
        [userId]
    );
    return res.rows[0];
};

export const getProfile = async (userId) => {
    const res = await query(
        `SELECT user_id, plan, searches_limit, searches_used
         FROM predictor_profiles WHERE user_id = $1`,
        [userId]
    );
    return res.rows[0] || null;
};

export const incrementUsed = async (userId) => {
    const res = await query(
        `UPDATE predictor_profiles SET searches_used = searches_used + 1, updated_at = NOW()
         WHERE user_id = $1
         RETURNING user_id, plan, searches_limit, searches_used`,
        [userId]
    );
    return res.rows[0];
};

// Grant a pack (called after verified payment).
export const grantSearches = async (userId, n) => {
    const res = await query(
        `INSERT INTO predictor_profiles (user_id, plan, searches_limit)
         VALUES ($1, 'paid', $2)
         ON CONFLICT (user_id) DO UPDATE
           SET searches_limit = predictor_profiles.searches_limit + $2,
               plan = 'paid',
               updated_at = NOW()
         RETURNING user_id, plan, searches_limit, searches_used`,
        [userId, n]
    );
    return res.rows[0];
};

// ── Saved searches ───────────────────────────────────────────────────────────

export const getSearchByCombo = async (userId, comboHash) => {
    const res = await query(
        `SELECT id, inputs, result, created_at
         FROM predictor_searches WHERE user_id = $1 AND combo_hash = $2`,
        [userId, comboHash]
    );
    return res.rows[0] || null;
};

export const insertSearch = async ({ userId, comboHash, inputs, result }) => {
    const res = await query(
        `INSERT INTO predictor_searches (user_id, combo_hash, inputs, result)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [userId, comboHash, JSON.stringify(inputs), JSON.stringify(result)]
    );
    return res.rows[0];
};

export const listSearches = async (userId) => {
    const res = await query(
        `SELECT id, inputs, result->'counts' AS counts, created_at
         FROM predictor_searches WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );
    return res.rows;
};

export const getSearch = async (userId, id) => {
    const res = await query(
        `SELECT id, inputs, result, created_at
         FROM predictor_searches WHERE user_id = $1 AND id = $2`,
        [userId, id]
    );
    return res.rows[0] || null;
};

// ── Payments ─────────────────────────────────────────────────────────────────

export const createPayment = async ({ userId, razorpayOrderId, amount, searchesGranted }) => {
    const res = await query(
        `INSERT INTO predictor_payments (user_id, razorpay_order_id, amount, searches_granted)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, razorpayOrderId, amount, searchesGranted]
    );
    return res.rows[0];
};

// Mark paid exactly once (status guard prevents double-granting on retry).
export const markPaymentPaid = async ({ userId, razorpayOrderId, razorpayPayId }) => {
    const res = await query(
        `UPDATE predictor_payments
         SET status = 'PAID', razorpay_payment_id = $3
         WHERE user_id = $1 AND razorpay_order_id = $2 AND status = 'CREATED'
         RETURNING id, searches_granted`,
        [userId, razorpayOrderId, razorpayPayId]
    );
    return res.rows[0] || null;
};
