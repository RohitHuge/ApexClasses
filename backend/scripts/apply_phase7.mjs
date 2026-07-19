/**
 * Applies Phase 7 migration + seeds rank_cutoffs to Neon dev DB directly via pg.
 * Run: node scripts/apply_phase7.mjs
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const NEON_DIRECT = 'postgresql://neondb_owner:npg_srxj52QtpUkR@ep-fragrant-truth-az2tbp58.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new pg.Pool({ connectionString: NEON_DIRECT, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });

const step = (n, msg) => console.log(`\n${'─'.repeat(55)}\n[${n}] ${msg}\n${'─'.repeat(55)}`);

try {
    // ── Step 1: Apply migration SQL ─────────────────────────────────────────
    step(1, 'Apply migration: 20260704000000_add_rank_predictor');

    const migrationSql = readFileSync(
        join(__dirname, '..', 'prisma', 'migrations', '20260704000000_add_rank_predictor', 'migration.sql'),
        'utf8'
    );

    // Check if already applied
    const tableCheck = await pool.query(
        `SELECT to_regclass('public.rank_cutoffs') AS tbl`
    );
    if (tableCheck.rows[0].tbl) {
        console.log('  rank_cutoffs already exists — skipping migration SQL');
    } else {
        await pool.query(migrationSql);
        console.log('  Migration SQL applied ✓');
    }

    // Register in _prisma_migrations so prisma migrate deploy doesn't re-apply
    await pool.query(`
        INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
        VALUES (
            gen_random_uuid()::text,
            'manual',
            NOW(),
            '20260704000000_add_rank_predictor',
            NULL, NULL, NOW(), 1
        )
        ON CONFLICT DO NOTHING
    `).catch(() => console.log('  (migration already in _prisma_migrations)'));
    console.log('  Registered in _prisma_migrations ✓');

    // ── Step 2: Verify new columns ──────────────────────────────────────────
    step(2, 'Verify schema');
    const cols = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name='predictor_profiles'
        ORDER BY ordinal_position`);
    console.log('  predictor_profiles cols:', cols.rows.map(r => r.column_name).join(', '));

    const rcCheck = await pool.query(`SELECT COUNT(*) FROM rank_cutoffs`);
    console.log('  rank_cutoffs rows:', rcCheck.rows[0].count);

    // ── Step 3: Seed rank_cutoffs ───────────────────────────────────────────
    step(3, 'Seed rank_cutoffs');
    const seedSql = readFileSync(join(ROOT, 'clgpredict', 'rank_cutoffs_seed.sql'), 'utf8');
    await pool.query(seedSql);
    const afterSeed = await pool.query(`SELECT COUNT(*) FROM rank_cutoffs`);
    console.log('  rank_cutoffs rows after seed:', afterSeed.rows[0].count);

    step('✓', 'Done');

} catch (e) {
    console.error('\nERROR:', e.message);
    if (e.detail) console.error('DETAIL:', e.detail);
    process.exit(1);
} finally {
    await pool.end();
}
