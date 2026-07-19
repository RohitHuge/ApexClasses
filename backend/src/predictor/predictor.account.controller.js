import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import * as AccountModel from './predictor.account.model.js';
import * as PredictorModel from './predictor.model.js';
import * as PredictorService from './predictor.service.js';
import * as AuthModel from '../auth/auth.model.js';
import { createRazorpayOrder } from '../order/payment.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-set-in-env';
const ACCESS_EXPIRES = '15m';
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

// Pricing is sourced from the shared products catalog (same as every other
// product), so it can be adjusted in one place without code changes.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '../order/products.json');
const PRODUCTS = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const PREDICTOR_PRODUCT = PRODUCTS.predictor_pack || {};

export const PACK_SIZE = PREDICTOR_PRODUCT.pack ?? 15;    // searches granted per purchase
export const PACK_PRICE = PREDICTOR_PRODUCT.price ?? 99;  // INR

const signAccess = (u) =>
    jwt.sign({ id: u.id, email: u.email, name: u.name, role: u.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

const setRefreshCookie = (res, token) =>
    res.cookie('apex_refresh', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_MS,
        path: '/',
    });

const publicProfile = (p) =>
    p
        ? { plan: p.plan, used: p.searches_used, limit: p.searches_limit, remaining: Math.max(0, p.searches_limit - p.searches_used) }
        : { plan: 'free', used: 0, limit: 0, remaining: 0 };

// Stable hash of a normalized input combo (re-opening the same combo is free).
const comboHashOf = ({ percentile, category, homeUniversity, branches, tfws }) => {
    const norm = (branches || []).slice().sort().join(',');
    const str = `${Number(percentile).toFixed(2)}|${category}|${homeUniversity ? 1 : 0}|${tfws ? 1 : 0}|${norm}`;
    return crypto.createHash('sha256').update(str).digest('hex');
};

const validatePredictInput = (body) => {
    const pct = Number(body.percentile);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return 'percentile must be a number between 0 and 100';
    if (!body.category || !PredictorService.SELECTABLE_CATEGORIES.includes(body.category)) return 'invalid category';
    if (body.branches !== undefined && !Array.isArray(body.branches)) return 'branches must be an array';
    return null;
};

/**
 * POST /api/predictor/guest  { name, phone }
 * Create/link a password-less guest account from the lead panel and log them in.
 * A phone already tied to a password account is asked to log in instead.
 */
export const guest = async (req, res) => {
    try {
        const { name, phone } = req.body || {};
        if (!name || !String(name).trim()) return res.status(400).json({ error: 'name is required' });
        const phoneStr = String(phone || '').replace(/\s+/g, '');
        if (!/^[0-9+]{7,15}$/.test(phoneStr)) return res.status(400).json({ error: 'a valid phone number is required' });

        const existing = await AccountModel.findUsersByPhone(phoneStr);
        if (existing.some((u) => u.password)) {
            return res.status(409).json({
                error: 'An account with this phone already exists. Please log in.',
                code: 'ACCOUNT_EXISTS',
            });
        }

        let user = existing.find((u) => !u.password) || null;
        if (!user) {
            user = await AccountModel.createGuestUser({ name: String(name).trim().slice(0, 255), phone: phoneStr });
            // keep a lead row for the team (only on first creation)
            PredictorModel.createLead({ name: user.name, phone: phoneStr, percentile: null, category: null, branches: null }).catch(() => {});
        }
        await AccountModel.getOrCreateProfile(user.id);

        const accessToken = signAccess(user);
        const refreshToken = uuidv4();
        await AuthModel.setRefreshToken(user.id, refreshToken, new Date(Date.now() + REFRESH_MS));
        setRefreshCookie(res, refreshToken);

        const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        res.status(201).json({ success: true, accessToken, user: safe, isGuest: !user.email });
    } catch (err) {
        console.error('Predictor guest error:', err.message);
        res.status(500).json({ error: 'Could not start your session' });
    }
};

/** GET /api/predictor/profile (auth) — plan + percentile quota + rank quota. */
export const profile = async (req, res) => {
    try {
        const p = await AccountModel.getOrCreateProfile(req.user.id);
        const rankRemaining = Math.max(0, (p.rank_searches_limit || 0) - (p.rank_searches_used || 0));
        res.json({
            success: true,
            profile: publicProfile(p),
            rankProfile: {
                used: p.rank_searches_used || 0,
                limit: p.rank_searches_limit || 0,
                remaining: rankRemaining,
            },
            price: PACK_PRICE,
            pack: PACK_SIZE,
        });
    } catch (err) {
        console.error('Predictor profile error:', err.message);
        res.status(500).json({ error: 'Failed to load profile' });
    }
};

/**
 * POST /api/predictor/reveal (auth) — full list for a combo.
 * Free re-open of a saved combo; otherwise consumes 1 of the quota and snapshots.
 */
export const reveal = async (req, res) => {
    try {
        const err = validatePredictInput(req.body || {});
        if (err) return res.status(400).json({ error: err });

        const userId = req.user.id;
        const inputs = {
            percentile: Number(req.body.percentile),
            category: req.body.category,
            homeUniversity: Boolean(req.body.homeUniversity),
            branches: req.body.branches || [],
            tfws: Boolean(req.body.tfws),
        };
        const comboHash = comboHashOf(inputs);

        // Already revealed → return the frozen snapshot, no charge.
        const cached = await AccountModel.getSearchByCombo(userId, comboHash);
        if (cached) {
            return res.json({ success: true, fromCache: true, savedId: cached.id, ...cached.result });
        }

        // Quota check.
        const prof = await AccountModel.getOrCreateProfile(userId);
        if (prof.searches_limit - prof.searches_used <= 0) {
            return res.status(402).json({
                error: 'You have no searches left.',
                code: 'QUOTA_EXHAUSTED',
                profile: publicProfile(prof),
            });
        }

        const result = await PredictorService.predict({ ...inputs, unlocked: true });
        const saved = await AccountModel.insertSearch({ userId, comboHash, inputs, result });
        const updated = await AccountModel.incrementUsed(userId);

        res.json({ success: true, fromCache: false, savedId: saved.id, profile: publicProfile(updated), ...result });
    } catch (err) {
        console.error('Predictor reveal error:', err.message);
        res.status(500).json({ error: 'Failed to reveal results' });
    }
};

/** GET /api/predictor/searches (auth) — saved search list. */
export const searches = async (req, res) => {
    try {
        const rows = await AccountModel.listSearches(req.user.id);
        res.json({ success: true, searches: rows });
    } catch (err) {
        console.error('Predictor searches error:', err.message);
        res.status(500).json({ error: 'Failed to load searches' });
    }
};

/** GET /api/predictor/searches/:id (auth) — one saved snapshot. */
export const searchDetail = async (req, res) => {
    try {
        const row = await AccountModel.getSearch(req.user.id, Number(req.params.id));
        if (!row) return res.status(404).json({ error: 'Search not found' });
        res.json({ success: true, search: row });
    } catch (err) {
        console.error('Predictor search detail error:', err.message);
        res.status(500).json({ error: 'Failed to load search' });
    }
};

/** GET /api/predictor/admin/stats (admin) — business metrics across predictor tables. */
export const adminStats = async (_req, res) => {
    try {
        const s = await AccountModel.adminStats();
        res.json({
            success: true,
            stats: {
                totalProfiles: Number(s.total_profiles),
                paidProfiles: Number(s.paid_profiles),
                // Percentile
                searchesUsed: Number(s.searches_used),
                searchesGranted: Number(s.searches_granted),
                savedPctSearches: Number(s.saved_pct_searches),
                // Rank
                rankSearchesUsed: Number(s.rank_searches_used),
                rankSearchesGranted: Number(s.rank_searches_granted),
                savedRankSearches: Number(s.saved_rank_searches),
                // Payments
                paidPayments: Number(s.paid_payments),
                paidRankPayments: Number(s.paid_rank_payments),
                totalRevenue: Number(s.total_revenue),
                rankRevenue: Number(s.rank_revenue),
            },
        });
    } catch (err) {
        console.error('Predictor admin stats error:', err.message);
        res.status(500).json({ error: 'Failed to load predictor stats' });
    }
};

/** POST /api/predictor/pay/create (auth) — start a ₹99 / 15-search purchase. */
export const payCreate = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await createRazorpayOrder(PACK_PRICE, `pred_${userId.slice(0, 8)}_${Date.now()}`);
        await AccountModel.createPayment({ userId, razorpayOrderId: order.id, amount: PACK_PRICE, searchesGranted: PACK_SIZE });
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            pack: PACK_SIZE,
        });
    } catch (err) {
        console.error('Predictor pay create error:', err.message);
        res.status(500).json({ error: 'Could not start payment' });
    }
};

/** POST /api/predictor/pay/verify (auth) — verify signature, grant the pack. */
export const payVerify = async (req, res) => {
    try {
        const userId = req.user.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment fields' });
        }
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        if (expected !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // markPaymentPaid only succeeds once (status guard) → no double grant.
        const paid = await AccountModel.markPaymentPaid({ userId, razorpayOrderId: razorpay_order_id, razorpayPayId: razorpay_payment_id });
        if (!paid) {
            const prof = await AccountModel.getProfile(userId);
            return res.json({ success: true, alreadyProcessed: true, profile: publicProfile(prof) });
        }
        const updated = await AccountModel.grantSearches(userId, paid.searches_granted);
        res.json({ success: true, profile: publicProfile(updated) });
    } catch (err) {
        console.error('Predictor pay verify error:', err.message);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};
