/**
 * sync_dev_db.mjs
 *
 * Clones the VPS prod DB into the Neon dev DB, applies any pending Prisma
 * migrations, seeds rank_cutoffs, and rewrites .env to point at Neon.
 *
 * Run: node scripts/sync_dev_db.mjs
 */

import { execSync }           from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname }      from 'path';
import { fileURLToPath }      from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND   = join(__dirname, '..');
const ROOT      = join(BACKEND, '..');

// ── Connection strings ────────────────────────────────────────────────────────
const PROD_URL      = 'postgres://postgres:strongpassword@82.180.144.69:5432/apex_db';
const NEON_POOLER   = 'postgresql://neondb_owner:npg_srxj52QtpUkR@ep-fragrant-truth-az2tbp58-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const NEON_DIRECT   = 'postgresql://neondb_owner:npg_srxj52QtpUkR@ep-fragrant-truth-az2tbp58.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const SEED_FILE     = join(ROOT, 'clgpredict', 'rank_cutoffs_seed.sql');
const ENV_FILE      = join(BACKEND, '.env');

// ── Helpers ───────────────────────────────────────────────────────────────────
const step = (n, msg) => console.log(`\n${'─'.repeat(60)}\n[${n}] ${msg}\n${'─'.repeat(60)}`);
const run  = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', shell: true, ...opts });

// ── Step 1: Dump prod → restore into Neon ────────────────────────────────────
step(1, 'Dump VPS prod DB → restore into Neon dev DB');
run(`pg_dump "${PROD_URL}" --no-owner --no-acl --clean --if-exists -Fp | psql "${NEON_DIRECT}"`);

// ── Step 2: Apply any pending Prisma migrations ───────────────────────────────
step(2, 'Apply pending Prisma migrations to Neon');
// datasource block has no url= so we pass --url directly (driver-adapter project)
run(`npx prisma migrate deploy --url "${NEON_DIRECT}"`, { cwd: BACKEND });

// ── Step 3: Seed rank_cutoffs (idempotent — ON CONFLICT DO NOTHING) ───────────
step(3, 'Seed rank_cutoffs into Neon');
run(`npx prisma db execute --url "${NEON_DIRECT}" --file "${SEED_FILE}"`, { cwd: BACKEND });

// ── Step 4: Rewrite .env to point at Neon ────────────────────────────────────
step(4, 'Update .env → Neon connection strings');
let env = readFileSync(ENV_FILE, 'utf8');

// Replace DATABASE_URL line
env = env.replace(
    /^DATABASE_URL=.*$/m,
    `DATABASE_URL="${NEON_POOLER}"`
);
// Replace DIRECT_URL line
env = env.replace(
    /^DIRECT_URL=.*$/m,
    `DIRECT_URL="${NEON_DIRECT}"`
);
// Replace or add DATABASE_SSL
env = env.replace(/^DATABASE_SSL=.*$/m, 'DATABASE_SSL=true');

writeFileSync(ENV_FILE, env, 'utf8');
console.log('  .env updated.');

// ── Done ──────────────────────────────────────────────────────────────────────
step('✓', 'Dev DB sync complete');
console.log(`  Prod snapshot  →  Neon (neondb)`);
console.log(`  Migrations     →  applied`);
console.log(`  rank_cutoffs   →  seeded`);
console.log(`  .env           →  pointing at Neon\n`);
