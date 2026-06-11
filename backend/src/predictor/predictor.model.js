import { query } from '../db/db.js';

const YEAR = 2024;

/**
 * Distinct branches present in the cutoff data (for the UI dropdown).
 */
export const getBranches = async () => {
    const res = await query(
        `SELECT DISTINCT branch FROM cutoffs ORDER BY branch ASC`
    );
    return res.rows.map((r) => r.branch);
};

/**
 * Core prediction lookup.
 *
 * For each (college, branch) we pick the single best (lowest) closing cutoff
 * across the student's effective category set, and record which category
 * achieved it. Only rows within the reach window (cutoff <= percentile + slack)
 * are returned; bucketing into safe/moderate/reach happens in the service.
 *
 * @param {number}   percentile        student percentile
 * @param {string[]} effectiveCategories  expanded category codes to search
 * @param {string[]|null} branches      optional branch filter (null = all)
 * @param {number}   reachSlack         how far above the percentile to still include
 */
/**
 * Persist a lead captured at the results gate.
 */
export const createLead = async ({ name, phone, percentile, category, branches }) => {
    const res = await query(
        `INSERT INTO predictor_leads (name, phone, percentile, category, branches)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [name, phone, percentile ?? null, category ?? null, branches ?? null]
    );
    return res.rows[0];
};

export const findEligible = async (percentile, effectiveCategories, branches, reachSlack) => {
    const res = await query(
        `WITH ranked AS (
            SELECT c.code,
                   c.name,
                   cu.branch,
                   cu.category,
                   cu.cutoff,
                   ROW_NUMBER() OVER (
                       PARTITION BY c.id, cu.branch
                       ORDER BY cu.cutoff ASC
                   ) AS rn
            FROM cutoffs cu
            JOIN colleges c ON c.id = cu.college_id
            WHERE cu.year = $1
              AND cu.category = ANY($2::text[])
              AND ($3::text[] IS NULL OR cu.branch = ANY($3::text[]))
              AND cu.cutoff <= $4::numeric + $5::numeric
        )
        SELECT code,
               name,
               branch,
               cutoff::float        AS best_cutoff,
               category             AS via_category,
               ROUND($4::numeric - cutoff, 3)::float AS margin
        FROM ranked
        WHERE rn = 1
        ORDER BY best_cutoff DESC`,
        [YEAR, effectiveCategories, branches, percentile, reachSlack]
    );
    return res.rows;
};
