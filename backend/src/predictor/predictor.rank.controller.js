import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as AccountModel from './predictor.account.model.js';
import * as RankService from './predictor.rank.service.js';
import { createRazorpayOrder } from '../order/payment.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '../order/products.json');
const PRODUCTS = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const RANK_PRODUCT = PRODUCTS.rank_predictor_pack || {};

export const RANK_PACK_SIZE  = RANK_PRODUCT.pack  ?? 3;
export const RANK_PACK_PRICE = RANK_PRODUCT.price ?? 50;

const publicRankProfile = (p) =>
    p
        ? {
            plan: p.plan,
            used: p.rank_searches_used,
            limit: p.rank_searches_limit,
            remaining: Math.max(0, p.rank_searches_limit - p.rank_searches_used),
          }
        : { plan: 'free', used: 0, limit: 0, remaining: 0 };

const validateRankInput = (body) => {
    const rank = Number(body.rank);
    if (!Number.isInteger(rank) || rank < 1 || rank > 300000) return 'rank must be an integer between 1 and 300000';
    if (!body.category || !RankService.SELECTABLE_CATEGORIES.includes(body.category)) return 'invalid category';
    if (body.branches !== undefined && !Array.isArray(body.branches)) return 'branches must be an array';
    return null;
};

// Stable hash — prefixed with 'rank|' to guarantee no collision with percentile hashes.
const comboHashOf = ({ rank, category, homeUniversity, branches, tfws }) => {
    const norm = (branches || []).slice().sort().join(',');
    const str = `rank|${rank}|${category}|${homeUniversity ? 1 : 0}|${tfws ? 1 : 0}|${norm}`;
    return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * POST /api/predictor/rank/predict  (no auth)
 * Returns a 3/bucket preview. Full list requires auth + quota via /rank/reveal.
 */
export const rankPredict = async (req, res) => {
    try {
        const err = validateRankInput(req.body || {});
        if (err) return res.status(400).json({ error: err });

        const { rank, category, homeUniversity, branches, tfws } = req.body;
        const result = await RankService.predictByRank({
            rank: Number(rank),
            category,
            homeUniversity: Boolean(homeUniversity),
            branches: branches || [],
            tfws: Boolean(tfws),
            unlocked: false,
        });
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Rank predict error:', err.message);
        res.status(500).json({ error: 'Prediction failed' });
    }
};

/**
 * GET /api/predictor/rank/meta  (no auth)
 * Returns distinct branches available in rank_cutoffs for the UI chip list.
 */
export const rankMeta = async (_req, res) => {
    try {
        const { getRankBranches } = await import('./predictor.rank.model.js');
        const branches = await getRankBranches();
        res.json({ success: true, branches, categories: RankService.SELECTABLE_CATEGORIES });
    } catch (err) {
        console.error('Rank meta error:', err.message);
        res.status(500).json({ error: 'Failed to load meta' });
    }
};

/**
 * POST /api/predictor/rank/reveal  (auth required)
 * Full list for a combo. Cached re-opens are free; new combos consume 1 rank search.
 */
export const rankReveal = async (req, res) => {
    try {
        const err = validateRankInput(req.body || {});
        if (err) return res.status(400).json({ error: err });

        const userId = req.user.id;
        const inputs = {
            rank: Number(req.body.rank),
            category: req.body.category,
            homeUniversity: Boolean(req.body.homeUniversity),
            branches: req.body.branches || [],
            tfws: Boolean(req.body.tfws),
        };
        const comboHash = comboHashOf(inputs);

        // Check if this combo was already unlocked (quota dedup — no double charge).
        const existing = await AccountModel.getSearchByCombo(userId, comboHash);

        if (!existing) {
            // First reveal — check quota, charge 1 search, record combo.
            const prof = await AccountModel.getOrCreateProfile(userId);
            if (prof.rank_searches_limit - prof.rank_searches_used <= 0) {
                return res.status(402).json({
                    error: 'You have no rank searches left.',
                    code: 'RANK_QUOTA_EXHAUSTED',
                    rankProfile: publicRankProfile(prof),
                });
            }
        }

        // Always run live query — ensures fresh location/website data and correct metrics.
        const result = await RankService.predictByRank({ ...inputs, unlocked: true });

        let savedId = existing?.id;
        let updated;
        if (!existing) {
            const saved = await AccountModel.insertSearch({ userId, comboHash, inputs, result, mode: 'rank' });
            savedId = saved.id;
            updated = await AccountModel.incrementRankUsed(userId);
        }

        res.json({
            success: true,
            fromCache: !!existing,
            savedId,
            ...(updated ? { rankProfile: publicRankProfile(updated) } : {}),
            ...result,
        });
    } catch (err) {
        console.error('Rank reveal error:', err.message);
        res.status(500).json({ error: 'Failed to reveal rank results' });
    }
};

/** POST /api/predictor/rank/pay/create  (auth) */
export const rankPayCreate = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await createRazorpayOrder(RANK_PACK_PRICE, `rank_${userId.slice(0, 8)}_${Date.now()}`);
        await AccountModel.createPayment({
            userId,
            razorpayOrderId: order.id,
            amount: RANK_PACK_PRICE,
            searchesGranted: RANK_PACK_SIZE,
            productType: 'rank',
        });
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            pack: RANK_PACK_SIZE,
        });
    } catch (err) {
        console.error('Rank pay create error:', err.message || err.error?.description || err);
        res.status(500).json({ error: 'Could not start payment' });
    }
};

/** POST /api/predictor/rank/pay/verify  (auth) */
export const rankPayVerify = async (req, res) => {
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

        const paid = await AccountModel.markPaymentPaid({
            userId,
            razorpayOrderId: razorpay_order_id,
            razorpayPayId: razorpay_payment_id,
        });
        if (!paid) {
            const prof = await AccountModel.getRankProfile(userId);
            return res.json({ success: true, alreadyProcessed: true, rankProfile: publicRankProfile(prof) });
        }

        // Grant to rank quota (product_type returned by markPaymentPaid confirms this is a rank payment)
        const updated = await AccountModel.grantRankSearches(userId, paid.searches_granted);
        res.json({ success: true, rankProfile: publicRankProfile(updated) });
    } catch (err) {
        console.error('Rank pay verify error:', err.message);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};
