import * as PredictorModel from './predictor.model.js';
import * as PredictorService from './predictor.service.js';

/**
 * GET /api/predictor/meta
 * Branches + selectable categories for populating the UI controls.
 */
export const getMeta = async (_req, res) => {
    try {
        const branches = await PredictorModel.getBranches();
        res.json({
            success: true,
            branches,
            categories: PredictorService.SELECTABLE_CATEGORIES,
        });
    } catch (err) {
        console.error('Predictor meta error:', err.message);
        res.status(500).json({ error: 'Failed to load predictor options' });
    }
};

/**
 * POST /api/predictor/predict
 * Body: { percentile, category, homeUniversity?, branches?, tfws? }
 */
export const predict = async (req, res) => {
    try {
        const { percentile, category, homeUniversity, branches, tfws } = req.body || {};

        const pct = Number(percentile);
        if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
            return res.status(400).json({ error: 'percentile must be a number between 0 and 100' });
        }
        if (!category || !PredictorService.SELECTABLE_CATEGORIES.includes(category)) {
            return res.status(400).json({
                error: `category is required and must be one of: ${PredictorService.SELECTABLE_CATEGORIES.join(', ')}`,
            });
        }
        if (branches !== undefined && !Array.isArray(branches)) {
            return res.status(400).json({ error: 'branches must be an array of branch names' });
        }

        const result = await PredictorService.predict({
            percentile: pct,
            category,
            homeUniversity: Boolean(homeUniversity),
            branches,
            tfws: Boolean(tfws),
        });

        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Predictor predict error:', err.message);
        res.status(500).json({ error: 'Failed to run prediction' });
    }
};
