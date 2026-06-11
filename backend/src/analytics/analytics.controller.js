import * as AnalyticsModel from './analytics.model.js';

const ALLOWED_EVENTS = new Set([
    'predictor_open',
    'predictor_input_changed',
    'predictor_predict_run',
    'predictor_branch_toggled',
    'predictor_compare_toggled',
    'predictor_share_link_copied',
    'predictor_pdf_downloaded',
    'predictor_lead_submitted',
    'predictor_empty_state_seen',
]);

/**
 * POST /api/analytics/event
 * Body: { event, props? }
 * Fire-and-forget; no auth, no PII. We strip large props server-side.
 */
export const capture = async (req, res) => {
    try {
        const { event, props } = req.body || {};
        if (!event || typeof event !== 'string' || event.length > 64) {
            return res.status(400).json({ error: 'event is required (string ≤ 64 chars)' });
        }
        if (!ALLOWED_EVENTS.has(event)) {
            return res.status(400).json({ error: `unknown event: ${event}` });
        }
        // Strip anything that could be PII. We allow only primitives + small strings.
        const clean = {};
        if (props && typeof props === 'object') {
            for (const [k, v] of Object.entries(props)) {
                if (k.length > 32) continue;
                if (typeof v === 'string') {
                    if (v.length > 64) continue;
                    clean[k] = v;
                } else if (typeof v === 'number' || typeof v === 'boolean') {
                    clean[k] = v;
                }
            }
        }

        // fire-and-forget: respond 202 immediately, persist async
        res.status(202).json({ ok: true });
        AnalyticsModel.record(event, clean).catch((e) => {
            console.error('Analytics persist failed:', e.message);
        });
    } catch (e) {
        console.error('Analytics controller error:', e.message);
        res.status(500).json({ error: 'Failed to record event' });
    }
};

/**
 * GET /api/analytics/summary
 * Admin only — returns event counts for the last 7 days. Used to verify it's working.
 */
export const summary = async (_req, res) => {
    try {
        const data = await AnalyticsModel.summary();
        res.json({ success: true, data });
    } catch (e) {
        console.error('Analytics summary error:', e.message);
        res.status(500).json({ error: 'Failed to load summary' });
    }
};
