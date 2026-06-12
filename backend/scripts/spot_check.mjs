import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(`
  SELECT c.code, c.name, cu.branch, cu.category, cu.cutoff
  FROM cutoffs cu JOIN colleges c ON c.id = cu.college_id
  WHERE cu.year = 2024 AND cu.branch = 'Computer'
    AND cu.category = ANY(ARRAY['OBC','OPEN','LOBC','LOPEN'])
  ORDER BY cu.cutoff DESC LIMIT 5
`);
console.log('Top 5 Computer cutoffs for OBC+OPEN+L*:');
r.rows.forEach(row => console.log('  ', row.code, row.name.slice(0,30).padEnd(30), row.category.padEnd(6), row.cutoff));
await c.end();
