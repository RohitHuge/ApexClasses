import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query } from '../src/db/db.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dir, '../prisma/migrations/20260704000000_add_rank_predictor/migration.sql');
const sql = readFileSync(sqlPath, 'utf8');

// Verify current state first
const tableCheck = await query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema='public' AND table_name='rank_cutoffs'`
);

if (tableCheck.rows.length > 0) {
  console.log('rank_cutoffs table already exists — checking columns...');
} else {
  console.log('rank_cutoffs not found — applying migration...');
  const stmts = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));

  for (const stmt of stmts) {
    try {
      await query(stmt);
      console.log('OK :', stmt.slice(0, 70).replace(/\n/g, ' '));
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log('SKIP:', stmt.slice(0, 60).replace(/\n/g, ' '));
      } else {
        console.error('ERR :', msg.split('\n')[0]);
        console.error('     stmt:', stmt.slice(0, 60).replace(/\n/g, ' '));
        process.exit(1);
      }
    }
  }
}

// Verify final state
const verify = await query(`
  SELECT
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='rank_cutoffs') AS has_rank_cutoffs,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='predictor_profiles' AND column_name='rank_searches_limit') AS has_rank_limit,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='predictor_searches' AND column_name='mode') AS has_mode,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='predictor_payments' AND column_name='product_type') AS has_product_type
`);

const r = verify.rows[0];
console.log('\nVerification:');
console.log('  rank_cutoffs table:              ', r.has_rank_cutoffs === '1' ? '✅' : '❌');
console.log('  predictor_profiles.rank_*:       ', r.has_rank_limit === '1' ? '✅' : '❌');
console.log('  predictor_searches.mode:         ', r.has_mode === '1' ? '✅' : '❌');
console.log('  predictor_payments.product_type: ', r.has_product_type === '1' ? '✅' : '❌');

process.exit(0);
