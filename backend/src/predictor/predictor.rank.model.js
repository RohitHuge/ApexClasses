import { query } from '../db/db.js';

const YEAR = 2024;

export const getRankBranches = async () => {
    const res = await query(
        `SELECT DISTINCT branch FROM rank_cutoffs ORDER BY branch ASC`
    );
    return res.rows.map((r) => r.branch);
};

/**
 * Core rank-based prediction lookup.
 *
 * For each (college, branch) we pick the single best (lowest) closing rank
 * across the student's effective category set, and record which category
 * achieved it. Only rows within reach (closing_rank <= student_rank + slack)
 * are returned; bucketing happens in the service layer.
 *
 * margin = closing_rank - student_rank
 *   positive → student rank is better than cutoff → safe
 *   negative → student rank is worse than cutoff  → reach
 */
export const findEligibleByRank = async (rank, effectiveCategories, branches, reachSlack) => {
    const res = await query(
        `WITH ranked AS (
            SELECT c.code,
                   c.name,
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
              AND rc.closing_rank <= $4::int + $5::int
        )
        SELECT code,
               name,
               branch,
               closing_rank                        AS best_rank,
               category                            AS via_category,
               (closing_rank - $4::int)            AS margin
        FROM ranked
        WHERE rn = 1
        ORDER BY closing_rank ASC`,
        [YEAR, effectiveCategories, branches, rank, reachSlack]
    );
    return res.rows;
};
