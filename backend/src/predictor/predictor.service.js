import * as PredictorModel from './predictor.model.js';

// ── Tunable constants ────────────────────────────────────────────────────────
// Bucketing thresholds (percentile points relative to the closing cutoff).
export const SAFE_MARGIN = 2.0;   // cutoff <= pct - 2  => High chance
export const REACH_SLACK = 1.0;   // cutoff <= pct + 1  => still shown (Ambitious)

// Student-selectable reservation categories (drives the UI dropdown).
// The L-* (home-university) variants are derived internally, never picked directly.
export const SELECTABLE_CATEGORIES = [
    'OPEN', 'OBC', 'SC', 'ST', 'VJ', 'NT1', 'NT2', 'NT3', 'SEBC', 'EWS',
];

// Per base category: the L-* (home-university) columns to also consider.
const LOCAL_VARIANTS = {
    OPEN: ['LOPEN'],
    OBC: ['LOBC', 'LOPEN'],
    SC: ['LSC', 'LOPEN'],
    ST: ['LST', 'LOPEN'],
    VJ: ['LOPEN'],
    NT1: ['LOPEN'],
    NT2: ['LOPEN'],
    NT3: ['LOPEN'],
    SEBC: ['LSEBC', 'LOPEN'],
    EWS: ['LOPEN'],
};

/**
 * Expand a student's choice into the full set of category columns to search.
 * Reserved candidates also compete in OPEN, and home-university students unlock
 * the L-* quota (lower cutoffs). TFWS is added only when opted in.
 */
export const resolveCategories = (category, homeUniversity, tfws) => {
    const base = new Set([category]);
    if (category !== 'OPEN') base.add('OPEN'); // reserved candidates also eligible for OPEN

    if (homeUniversity) {
        for (const v of LOCAL_VARIANTS[category] || []) base.add(v);
    }
    if (tfws) base.add('TFWS');

    return [...base];
};

const bucketOf = (margin) => {
    if (margin >= SAFE_MARGIN) return 'safe';
    if (margin >= 0) return 'moderate';
    return 'reach';
};

/**
 * Run a full prediction and return colleges grouped into safe/moderate/reach.
 */
export const predict = async ({ percentile, category, homeUniversity, branches, tfws }) => {
    const effective = resolveCategories(category, homeUniversity, tfws);
    const branchFilter = branches && branches.length ? branches : null;

    const rows = await PredictorModel.findEligible(
        percentile,
        effective,
        branchFilter,
        REACH_SLACK
    );

    const buckets = { safe: [], moderate: [], reach: [] };
    for (const r of rows) {
        const item = {
            code: r.code,
            college: r.name,
            branch: r.branch,
            cutoff: r.best_cutoff,
            margin: r.margin,
            viaCategory: r.via_category,
        };
        buckets[bucketOf(r.margin)].push(item);
    }

    return {
        query: { percentile, category, homeUniversity: !!homeUniversity, branches: branchFilter, tfws: !!tfws },
        effectiveCategories: effective,
        counts: {
            safe: buckets.safe.length,
            moderate: buckets.moderate.length,
            reach: buckets.reach.length,
            total: rows.length,
        },
        buckets,
    };
};
