import * as PredictorModel from './predictor.model.js';

// ── Tunable constants ────────────────────────────────────────────────────────
// Bucketing thresholds (percentile points relative to the closing cutoff).
export const SAFE_MARGIN = 2.0;   // cutoff <= pct - 2  => High chance
export const REACH_SLACK = 1.0;   // cutoff <= pct + 1  => still shown (Ambitious)

// Free preview: results shown per bucket before the lead/unlock gate.
// Enforced server-side so the full list never leaves the server while locked.
export const PREVIEW_LIMIT = 3;

// Friendly labels for the category that achieved a college's cutoff.
// L-* columns are the home-university (local) quota.
const CATEGORY_LABEL = {
    OPEN: 'Open', OBC: 'OBC', SC: 'SC', ST: 'ST', VJ: 'VJ',
    NT1: 'NT-1', NT2: 'NT-2', NT3: 'NT-3', SEBC: 'SEBC', EWS: 'EWS', TFWS: 'TFWS',
};
const categoryLabel = (raw) => {
    if (CATEGORY_LABEL[raw]) return CATEGORY_LABEL[raw];
    if (raw && raw[0] === 'L') {
        const base = raw.slice(1);
        return `Home-University ${CATEGORY_LABEL[base] || base}`;
    }
    return raw;
};

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
export const predict = async ({ percentile, category, homeUniversity, branches, tfws, unlocked = false }) => {
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
            viaLabel: categoryLabel(r.via_category),
        };
        buckets[bucketOf(r.margin)].push(item);
    }

    // Counts always reflect the true totals so the UI can show "unlock N more".
    const counts = {
        safe: buckets.safe.length,
        moderate: buckets.moderate.length,
        reach: buckets.reach.length,
        total: rows.length,
    };

    // Gate: while locked, only the free preview ever leaves the server.
    const visibleBuckets = unlocked
        ? buckets
        : {
            safe: buckets.safe.slice(0, PREVIEW_LIMIT),
            moderate: buckets.moderate.slice(0, PREVIEW_LIMIT),
            reach: buckets.reach.slice(0, PREVIEW_LIMIT),
        };

    return {
        query: { percentile, category, homeUniversity: !!homeUniversity, branches: branchFilter, tfws: !!tfws },
        effectiveCategories: effective,
        counts,
        buckets: visibleBuckets,
        locked: !unlocked,
        previewLimit: PREVIEW_LIMIT,
    };
};
