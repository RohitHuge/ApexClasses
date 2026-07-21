import crypto from 'crypto';
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
         RETURNING user_id, plan, searches_limit, searches_used,
                   rank_searches_limit, rank_searches_used`,
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

export const insertSearch = async ({ userId, comboHash, inputs, result, mode = 'percentile' }) => {
    const res = await query(
        `INSERT INTO predictor_searches (user_id, combo_hash, inputs, result, mode)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, created_at`,
        [userId, comboHash, JSON.stringify(inputs), JSON.stringify(result), mode]
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

// ── Shadow accounts ──────────────────────────────────────────────────────────

export const findShadowByPhone = async (phone) => {
    const res = await query(
        `SELECT id, phone, name, role, account_type, shadow_expires_at, shadow_device_token
         FROM users WHERE phone = $1 AND account_type IN ('shadow', 'registered')`,
        [phone]
    );
    return res.rows[0] || null;
};

export const createShadowUser = async (phone) => {
    const deviceToken = crypto.randomUUID();
    const res = await query(
        `INSERT INTO users (id, phone, name, role, account_type, shadow_expires_at, shadow_device_token)
         VALUES (gen_random_uuid()::text, $1, 'Student', 'user', 'shadow',
                 NOW() + INTERVAL '30 days', $2)
         RETURNING id, phone, name, role, account_type, shadow_device_token`,
        [phone, deviceToken]
    );
    return res.rows[0];
};

export const findShadowByToken = async (phone, deviceToken) => {
    const res = await query(
        `SELECT id, phone, name, role, account_type, shadow_expires_at
         FROM users
         WHERE phone = $1
           AND account_type = 'shadow'
           AND shadow_device_token = $2
           AND shadow_expires_at > NOW()`,
        [phone, deviceToken]
    );
    return res.rows[0] || null;
};

// ── Rank quota ───────────────────────────────────────────────────────────────

export const getRankProfile = async (userId) => {
    const res = await query(
        `SELECT user_id, plan, rank_searches_limit, rank_searches_used
         FROM predictor_profiles WHERE user_id = $1`,
        [userId]
    );
    return res.rows[0] || null;
};

export const incrementRankUsed = async (userId) => {
    const res = await query(
        `UPDATE predictor_profiles
         SET rank_searches_used = rank_searches_used + 1, updated_at = NOW()
         WHERE user_id = $1
         RETURNING user_id, plan, rank_searches_limit, rank_searches_used`,
        [userId]
    );
    return res.rows[0];
};

export const grantRankSearches = async (userId, n) => {
    const res = await query(
        `INSERT INTO predictor_profiles (user_id, plan, rank_searches_limit)
         VALUES ($1, 'paid', $2)
         ON CONFLICT (user_id) DO UPDATE
           SET rank_searches_limit = predictor_profiles.rank_searches_limit + $2,
               plan = 'paid',
               updated_at = NOW()
         RETURNING user_id, plan, rank_searches_limit, rank_searches_used`,
        [userId, n]
    );
    return res.rows[0];
};

// ── Payments ─────────────────────────────────────────────────────────────────

export const createPayment = async ({ userId, razorpayOrderId, amount, searchesGranted, productType = 'percentile' }) => {
    const res = await query(
        `INSERT INTO predictor_payments (user_id, razorpay_order_id, amount, searches_granted, product_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, razorpayOrderId, amount, searchesGranted, productType]
    );
    return res.rows[0];
};

// ── Admin stats ──────────────────────────────────────────────────────────────

// Aggregate business metrics across the predictor tables (admin dashboard).
export const adminStats = async () => {
    const res = await query(`
        SELECT
          (SELECT COUNT(*) FROM predictor_profiles)                                                           AS total_profiles,
          (SELECT COUNT(*) FROM predictor_profiles WHERE plan = 'paid')                                       AS paid_profiles,
          (SELECT COALESCE(SUM(searches_used), 0) FROM predictor_profiles)                                    AS searches_used,
          (SELECT COALESCE(SUM(searches_limit), 0) FROM predictor_profiles)                                   AS searches_granted,
          (SELECT COALESCE(SUM(rank_searches_used), 0) FROM predictor_profiles)                               AS rank_searches_used,
          (SELECT COALESCE(SUM(rank_searches_limit), 0) FROM predictor_profiles)                              AS rank_searches_granted,
          (SELECT COUNT(*) FROM predictor_searches WHERE mode = 'percentile')                                 AS saved_pct_searches,
          (SELECT COUNT(*) FROM predictor_searches WHERE mode = 'rank')                                       AS saved_rank_searches,
          (SELECT COUNT(*) FROM predictor_payments WHERE status = 'PAID')                                     AS paid_payments,
          (SELECT COUNT(*) FROM predictor_payments WHERE status = 'PAID' AND product_type = 'rank')           AS paid_rank_payments,
          (SELECT COALESCE(SUM(amount), 0) FROM predictor_payments WHERE status = 'PAID')                     AS total_revenue,
          (SELECT COALESCE(SUM(amount), 0) FROM predictor_payments WHERE status = 'PAID' AND product_type = 'rank') AS rank_revenue
    `);
    return res.rows[0];
};

// Mark paid exactly once (status guard prevents double-granting on retry).
// Returns searches_granted AND product_type so the caller knows which quota to top up.
export const markPaymentPaid = async ({ userId, razorpayOrderId, razorpayPayId }) => {
    const res = await query(
        `UPDATE predictor_payments
         SET status = 'PAID', razorpay_payment_id = $3
         WHERE user_id = $1 AND razorpay_order_id = $2 AND status = 'CREATED'
         RETURNING id, searches_granted, product_type`,
        [userId, razorpayOrderId, razorpayPayId]
    );
    return res.rows[0] || null;
};
