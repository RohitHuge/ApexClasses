# Database — Dev / Prod Split

Two separate databases, **same schema** (driven by Prisma migration files in git), **different data**.

| | Dev | Prod |
|---|---|---|
| Host | Supabase (`aws-1-ap-southeast-1`) | VPS Postgres (`82.180.144.69`) |
| Data | throwaway — safe to reset/seed | real customers (orders, payments, users, leads) |
| Used by | local `npm run dev` | the deployed VPS backend |

## Connection URLs (env)

- `DATABASE_URL` → **transaction pooler (port 6543)**. Used by the app at runtime (pg pool in `src/db/db.js` + Prisma adapter in `src/db/prisma.js`).
- `DIRECT_URL` → **session pooler (port 5432)**. Used by the Prisma **CLI for migrations only** (`prisma.config.ts`). Migrations cannot run through pgbouncer/6543.
- `DATABASE_SSL=true` for Supabase (managed PG requires SSL). `false` for the VPS.

Local `backend/.env` points at Dev. A commented PROD block is kept there to switch back if ever needed.

## Workflows

**Develop a schema change (against Dev):**
```
npm run prisma:migrate -- --name my_change   # prisma migrate dev — may reset Dev, that's fine
git add prisma/migrations && git commit
```

**Apply to Prod (from the VPS, with prod env vars set):**
```
npm run prisma:deploy   # prisma migrate deploy — apply-only, never resets, no shadow DB
```
> Never run `prisma migrate dev` against Prod.

**Re-seed cutoff reference data** (public data — fine on either DB):
```
# loads clgpredict/cutoffs_seed.sql via DIRECT_URL (idempotent ON CONFLICT DO NOTHING)
node -e "import('pg').then(async({default:p})=>{const fs=await import('fs');(await import('dotenv')).config();const c=new p.Client({connectionString:process.env.DIRECT_URL,ssl:{rejectUnauthorized:false}});await c.connect();await c.query(fs.readFileSync('../clgpredict/cutoffs_seed.sql','utf8'));await c.end();})"
```

## Current state
- Dev (Supabase) provisioned: all migrations applied + seeded (**77 colleges, 5999 cutoffs**). Runtime pooler + migration direct connection both verified.
- Prod (VPS) unchanged.
