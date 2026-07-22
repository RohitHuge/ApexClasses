import { query } from '../db/db.js';

const YEAR = 2024;

export const getRankBranches = async () => {
    const res = await query(
        `SELECT DISTINCT branch FROM rank_cutoffs ORDER BY branch ASC`
    );
    return res.rows.map((r) => r.branch);
};

/**
 * Reach colleges: closing_rank < rank AND closing_rank >= rank - reachSlack.
 * Returns the best (lowest) closing rank per (college, branch) combo,
 * sorted ASC so the most ambitious (lowest rank) comes first — which is the
 * correct CAP option-form order (ambitious options listed before safe ones).
 */
export const findReachByRank = async (rank, effectiveCategories, branches, reachSlack) => {
    const res = await query(
        `WITH ranked AS (
            SELECT c.code,
                   c.name,
                   c.location,
                   c.website,
                   rc.branch,
                   rc.category,
                   rc.closing_rank,
                   ROW_NUMBER() OVER (
                       PARTITION BY c.id, rc.branch
                       ORDER BY rc.closing_rank ASC
                   ) AS rn
            FROM rank_cutoffs rc
            JOIN colleges c ON c.id = rc.college_id
            WHERE rc.year = $1
              AND rc.category = ANY($2::text[])
              AND ($3::text[] IS NULL OR rc.branch = ANY($3::text[]))
              AND rc.closing_rank < $4::int
              AND rc.closing_rank >= $4::int - $5::int
        )
        SELECT code,
               name,
               location,
               website,
               branch,
               closing_rank                    AS best_rank,
               category                        AS via_category,
               (closing_rank - $4::int)        AS margin
        FROM ranked
        WHERE rn = 1
        ORDER BY closing_rank ASC`,
        [YEAR, effectiveCategories, branches, rank, reachSlack]
    );
    return res.rows;
};

/**
 * Safe colleges: closing_rank >= rank.
 * No upper bound — fetches all safe entries and lets the service cap at MAX_SAFE.
 * Sorted ASC so the narrowest-margin (most at-risk) safe colleges come first.
 */
export const findSafeByRank = async (rank, effectiveCategories, branches) => {
    const res = await query(
        `WITH ranked AS (
            SELECT c.code,
                   c.name,
                   c.location,
                   c.website,
                   rc.branch,
                   rc.category,
                   rc.closing_rank,
                   ROW_NUMBER() OVER (
                       PARTITION BY c.id, rc.branch
                       ORDER BY rc.closing_rank ASC
                   ) AS rn
            FROM rank_cutoffs rc
            JOIN colleges c ON c.id = rc.college_id
            WHERE rc.year = $1
              AND rc.category = ANY($2::text[])
              AND ($3::text[] IS NULL OR rc.branch = ANY($3::text[]))
              AND rc.closing_rank >= $4::int
        )
        SELECT code,
               name,
               location,
               website,
               branch,
               closing_rank                    AS best_rank,
               category                        AS via_category,
               (closing_rank - $4::int)        AS margin
        FROM ranked
        WHERE rn = 1
        ORDER BY closing_rank ASC`,
        [YEAR, effectiveCategories, branches, rank]
    );
    return res.rows;
};
