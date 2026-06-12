// 5.C.1 — Validate predictor logic against known scenarios.
// Tests the findEligible SQL + the resolveCategories / bucketOf logic from the service.
import 'dotenv/config';
import pg from 'pg';
import { resolveCategories, SAFE_MARGIN } from '../src/predictor/predictor.service.js';

const { Client } = pg;
const YEAR = 2024;
const REACH_SLACK = 1.0;

const findEligible = async (client, percentile, effective, branches) => {
  const res = await client.query(
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
    SELECT code, name, branch, cutoff::float AS best_cutoff,
           category AS via_category,
           ROUND($4::numeric - cutoff, 3)::float AS margin
    FROM ranked
    WHERE rn = 1
    ORDER BY best_cutoff DESC`,
    [YEAR, effective, branches, percentile, REACH_SLACK]
  );
  return res.rows;
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const scenarios = [
  { name: 'Top-tier OPEN, 99 pct, Computer only',        percentile: 99.0,  category: 'OPEN', homeUniversity: false, tfws: false, branches: ['Computer'] },
  { name: 'Mid-tier OBC, 90 pct, all branches, no L',    percentile: 90.0,  category: 'OBC',  homeUniversity: false, tfws: false, branches: null },
  { name: 'Mid-tier OBC, 90 pct, all branches, WITH L',  percentile: 90.0,  category: 'OBC',  homeUniversity: true,  tfws: false, branches: null },
  { name: 'SC category, 80 pct, home U, TFWS on',         percentile: 80.0,  category: 'SC',   homeUniversity: true,  tfws: true,  branches: null },
  { name: 'SEBC, 85 pct, home U',                         percentile: 85.0,  category: 'SEBC', homeUniversity: true,  tfws: false, branches: ['Computer','IT'] },
  { name: 'Low percentile, 50 pct, OPEN, all branches',   percentile: 50.0,  category: 'OPEN', homeUniversity: false, tfws: false, branches: null },
  { name: 'Very high, 99.5 pct, OBC, Computer only',      percentile: 99.5,  category: 'OBC',  homeUniversity: true,  tfws: false, branches: ['Computer'] },
  { name: 'EWS, 92 pct, home U',                          percentile: 92.0,  category: 'EWS',  homeUniversity: true,  tfws: false, branches: null },
];

let fail = 0;
for (const s of scenarios) {
  const effective = resolveCategories(s.category, s.homeUniversity, s.tfws);
  const rows = await findEligible(c, s.percentile, effective, s.branches);
  const safe   = rows.filter(r => r.margin >= SAFE_MARGIN).length;
  const moder  = rows.filter(r => r.margin >= 0 && r.margin < SAFE_MARGIN).length;
  const reach  = rows.filter(r => r.margin < 0).length;
  const top3   = rows.slice(0, 3).map(r => `${r.name.slice(0,20).padEnd(20)} ${r.branch.slice(0,18).padEnd(18)} ${r.best_cutoff.toFixed(2)} via ${r.via_category} (margin ${r.margin})`);

  console.log(`\n══ ${s.name}`);
  console.log(`   pct=${s.percentile} cat=${s.category} homeU=${s.homeUniversity} tfws=${s.tfws} branches=${s.branches ? s.branches.length : 'ALL'}`);
  console.log(`   effective categories: [${effective.join(', ')}]`);
  console.log(`   counts: safe=${safe}  moderate=${moder}  reach=${reach}  total=${rows.length}`);
  console.log(`   top 3:`);
  for (const t of top3) console.log(`     - ${t}`);

  // ── Invariants to assert ──
  if (rows.some(r => r.margin < -REACH_SLACK - 0.001)) {
    console.log(`   ❌ FAIL: row with margin < -${REACH_SLACK} (should never appear)`);
    fail++;
  }
  if (rows.some(r => r.best_cutoff > s.percentile + REACH_SLACK + 0.001)) {
    console.log(`   ❌ FAIL: row with cutoff > pct + ${REACH_SLACK} (REACH window broken)`);
    fail++;
  }
  if (rows.length === 0 && s.percentile >= 50) {
    console.log(`   ⚠️  WARN: no matches at all (pct >= 50)`);
  }
  if (s.homeUniversity && !effective.some(x => x.startsWith('L'))) {
    console.log(`   ❌ FAIL: homeUniversity=true but no L-* category in effective set`);
    fail++;
  }
  if (s.tfws && !effective.includes('TFWS')) {
    console.log(`   ❌ FAIL: tfws=true but TFWS not in effective set`);
    fail++;
  }
  if (s.category !== 'OPEN' && !effective.includes('OPEN')) {
    console.log(`   ❌ FAIL: reserved category but OPEN not in effective set`);
    fail++;
  }
  // branches filter respected
  if (s.branches && rows.some(r => !s.branches.includes(r.branch))) {
    console.log(`   ❌ FAIL: row with branch not in filter`);
    fail++;
  }
}

console.log(`\n${'═'.repeat(60)}\n${fail === 0 ? '✅ ALL INVARIANTS PASS' : `❌ ${fail} INVARIANT(S) FAILED`}\n`);
await c.end();
process.exit(fail === 0 ? 0 : 1);
