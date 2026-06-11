import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// 99.5 pct + 1.0 slack = 100.5. So cutoff <= 100.5 should match.
// Top 5 shows 99.901, 99.899, 99.797, 99.768, 99.712 — all <= 100.5.
// Why did the predictor return 0?
const r = await c.query(`
  WITH ranked AS (
    SELECT c.code, c.name, cu.branch, cu.category, cu.cutoff,
           ROW_NUMBER() OVER (PARTITION BY c.id, cu.branch ORDER BY cu.cutoff ASC) AS rn
    FROM cutoffs cu
    JOIN colleges c ON c.id = cu.college_id
    WHERE cu.year = 2024
      AND cu.category = ANY(ARRAY['OBC','OPEN','LOBC','LOPEN'])
      AND cu.branch = 'Computer'
      AND cu.cutoff <= 99.5 + 1.0
  )
  SELECT code, name, branch, category, cutoff::float, rn
  FROM ranked
  WHERE rn = 1
  ORDER BY cutoff DESC
  LIMIT 5
`);
console.log('For pct=99.5, branch=Computer, effective=[OBC,OPEN,LOBC,LOPEN]:');
r.rows.forEach(row => console.log('  ', row.code, row.name.slice(0,30).padEnd(30), row.category.padEnd(6), row.cutoff));
console.log('Total rows:', r.rows.length);
await c.end();
