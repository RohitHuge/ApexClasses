import * as RankModel from './predictor.rank.model.js';
import { SELECTABLE_CATEGORIES } from './predictor.service.js';

// Starting slack for reach query; expands dynamically if < 10 reach colleges found.
export const REACH_RANK_SLACK = 3000;
const REACH_SLACK_LADDER = [3000, 5000, 8000, 12000, 20000, 999999];

const MAX_REACH = 10;
const MAX_SAFE  = 20;

// Friendly labels for category codes in rank_cutoffs.
const RANK_CATEGORY_LABEL = {
    GOPENH: 'Open (Home Univ)', GOPENS: 'Open (State)', GOPENO: 'Open',
    GSCH: 'SC (Home Univ)',     GSCS: 'SC (State)',
    GSTH: 'ST (Home Univ)',     GSTS: 'ST (State)',
    GVJH: 'VJ (Home Univ)',     GVJS: 'VJ (State)',
    GNT1H: 'NT-1 (Home Univ)',  GNT1S: 'NT-1 (State)',
    GNT2H: 'NT-2 (Home Univ)',  GNT2S: 'NT-2 (State)',
    GNT3H: 'NT-3 (Home Univ)',  GNT3S: 'NT-3 (State)',
    GOBCH: 'OBC (Home Univ)',   GOBCS: 'OBC (State)',
    GSEBCH: 'SEBC (Home Univ)', GSEBCS: 'SEBC (State)',
    LOPENH: 'HU-Open (Home)',   LOPENS: 'HU-Open (State)', LOPENO: 'HU-Open',
    LSCH: 'HU-SC (Home)',       LSCS: 'HU-SC (State)',
    LSTH: 'HU-ST (Home)',       LSTS: 'HU-ST (State)',
    LVJH: 'HU-VJ (Home)',       LVJS: 'HU-VJ (State)',
    LNT1H: 'HU-NT1 (Home)',     LNT1S: 'HU-NT1 (State)',
    LNT2H: 'HU-NT2 (Home)',     LNT2S: 'HU-NT2 (State)',
    LNT3H: 'HU-NT3 (Home)',     LNT3S: 'HU-NT3 (State)',
    LOBCH: 'HU-OBC (Home)',     LOBCS: 'HU-OBC (State)',
    LSEBCH: 'HU-SEBC (Home)',   LSEBCS: 'HU-SEBC (State)',
    TFWS: 'TFWS', EWS: 'EWS',
};
const rankCategoryLabel = (raw) => RANK_CATEGORY_LABEL[raw] || raw;

/**
 * Piecewise-linear probability that a student with `studentRank` will be
 * admitted to a college whose 2024 closing rank was `closingRank`.
 *
 * gap = closingRank - studentRank
 *   positive → student rank is BETTER than cutoff (safe territory)
 *   negative → student rank is WORSE than cutoff  (reach territory)
 *
 * Two-segment linear decay, kink at 20% rank drop:
 *   drop 0–20% : probability = 100 - 2×drop
 *   drop 20–35%: probability = 60  - 4×(drop - 20)
 *   drop > 35% : probability = 0 (not included in results)
 */
export const calcProbability = (studentRank, closingRank) => {
    const gap = closingRank - studentRank;
    if (gap >= 500) return 100;
    if (gap >= 0)   return 99;
    const dropPct = (-gap / studentRank) * 100;
    if (dropPct <= 20) return Math.round(100 - 2 * dropPct);
    if (dropPct <= 35) return Math.max(0, Math.round(60 - 4 * (dropPct - 20)));
    return 0;
};

/**
 * Expand a student's category into the full set of rank_cutoffs.category
 * codes to query, based on homeUniversity flag.
 *
 * H-suffix = Home-University college seats (only eligible when homeUniversity=true)
 * S-suffix = State-level seats (open to all students)
 * O-suffix = Open/general seats (open to all students)
 * L prefix = Local/Home-University quota
 * G prefix = General (all Maharashtra) quota
 */
export const resolveRankCategories = (category, homeUniversity, tfws) => {
    const cats = new Set();

    // Open/general seats — H suffix only for home-university students
    if (homeUniversity) cats.add('GOPENH');
    cats.add('GOPENS');
    cats.add('GOPENO');
    if (homeUniversity) cats.add('LOPENH');
    cats.add('LOPENS');
    cats.add('LOPENO');

    // Reservation-specific variants
    // GH = General Home-univ quota (H suffix), GS = General State quota (S suffix)
    // L  = Local/HU quota (both H and S variants, HU students only)
    const VARIANTS = {
        OBC:  { GH: ['GOBCH'],   GS: ['GOBCS'],   L: ['LOBCH', 'LOBCS'] },
        SC:   { GH: ['GSCH'],    GS: ['GSCS'],    L: ['LSCH',  'LSCS'] },
        ST:   { GH: ['GSTH'],    GS: ['GSTS'],    L: ['LSTH',  'LSTS'] },
        VJ:   { GH: ['GVJH'],    GS: ['GVJS'],    L: ['LVJH',  'LVJS'] },
        NT1:  { GH: ['GNT1H'],   GS: ['GNT1S'],   L: ['LNT1H', 'LNT1S'] },
        NT2:  { GH: ['GNT2H'],   GS: ['GNT2S'],   L: ['LNT2H', 'LNT2S'] },
        NT3:  { GH: ['GNT3H'],   GS: ['GNT3S'],   L: ['LNT3H', 'LNT3S'] },
        SEBC: { GH: ['GSEBCH'],  GS: ['GSEBCS'],  L: ['LSEBCH', 'LSEBCS'] },
        EWS:  { GH: [],          GS: ['EWS'],     L: [] },
    };

    if (category !== 'OPEN' && VARIANTS[category]) {
        const v = VARIANTS[category];
        for (const c of v.GS) cats.add(c);
        if (homeUniversity) {
            for (const c of v.GH) cats.add(c);
            for (const c of v.L)  cats.add(c);
        }
    }

    if (tfws) cats.add('TFWS');

    return [...cats];
};

export { SELECTABLE_CATEGORIES };

export const predictByRank = async ({ rank, category, homeUniversity, branches, tfws, unlocked = false }) => {
    const effective    = resolveRankCategories(category, homeUniversity, tfws);
    const branchFilter = branches && branches.length ? branches : null;

    // ── Reach: expand slack until >= MAX_REACH colleges found ────────────────
    // Include ALL reach colleges regardless of probability — even 0% ambitions
    // belong in the CAP option form. Colleges are already sorted ASC by
    // closing_rank, which puts the most ambitious (lowest rank) first.
    let reachRows = [];
    for (const slack of REACH_SLACK_LADDER) {
        reachRows = await RankModel.findReachByRank(rank, effective, branchFilter, slack);
        if (reachRows.length >= MAX_REACH) break;
    }

    // ── Safe: independent query — no upper bound, never misses distant safe ──
    const safeRows = await RankModel.findSafeByRank(rank, effective, branchFilter);

    const toItem = (r) => ({
        code:        r.code,
        college:     r.name,
        branch:      r.branch,
        closingRank: r.best_rank,
        margin:      r.margin,
        probability: calcProbability(rank, r.best_rank),
        viaCategory: r.via_category,
        viaLabel:    rankCategoryLabel(r.via_category),
        type:        r.margin < 0 ? 'reach' : 'safe',
    });

    const reachAll = reachRows.map(toItem);   // already sorted: hardest (lowest rank) first
    const safeAll  = safeRows.map(toItem);    // already sorted: narrowest margin first

    const counts = {
        reach: reachAll.length,
        safe:  safeAll.length,
        total: reachAll.length + safeAll.length,
    };

    const fullResults = [
        ...reachAll.slice(0, MAX_REACH),
        ...safeAll.slice(0, MAX_SAFE),
    ];

    return {
        query: { rank, category, homeUniversity: !!homeUniversity, branches: branchFilter, tfws: !!tfws },
        effectiveCategories: effective,
        counts,
        results: unlocked ? fullResults : [],
        locked:  !unlocked,
    };
};
