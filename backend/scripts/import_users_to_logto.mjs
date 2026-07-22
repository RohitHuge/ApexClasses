/**
 * import_users_to_logto.mjs
 *
 * One-time migration: creates a Logto account for every user in our DB that
 * doesn't already have a logto_sub, then writes the returned Logto user ID
 * back to users.logto_sub.
 *
 * Usage:
 *   node scripts/import_users_to_logto.mjs             # live run
 *   node scripts/import_users_to_logto.mjs --dry-run   # print what would happen, no writes
 *
 * Requires env vars (backend .env):
 *   LOGTO_ENDPOINT, LOGTO_M2M_APP_ID, LOGTO_M2M_APP_SECRET, DATABASE_URL
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

// ── Load .env manually (no dotenv dependency in scripts) ──────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '../.env');
const envLines = readFileSync(envPath, 'utf8').split('\n');
for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
}

const DRY_RUN = process.argv.includes('--dry-run');
const ENDPOINT = process.env.LOGTO_ENDPOINT;
const M2M_ID   = process.env.LOGTO_M2M_APP_ID;
const M2M_SEC  = process.env.LOGTO_M2M_APP_SECRET;
const DB_URL   = process.env.DATABASE_URL;

if (!ENDPOINT || !M2M_ID || !M2M_SEC) {
    console.error('Missing LOGTO_ENDPOINT / LOGTO_M2M_APP_ID / LOGTO_M2M_APP_SECRET in .env');
    process.exit(1);
}

// ── Get M2M access token ──────────────────────────────────────────────────────
async function getM2MToken() {
    const res = await fetch(`${ENDPOINT}/oidc/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type:    'client_credentials',
            client_id:     M2M_ID,
            client_secret: M2M_SEC,
            resource:      `${ENDPOINT}/api`,
            scope:         'all',
        }),
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`M2M token failed: ${t}`);
    }
    const data = await res.json();
    return data.access_token;
}

// ── Create one user in Logto ──────────────────────────────────────────────────
async function createLogtoUser(token, user) {
    const body = {
        name:        user.name,
        primaryEmail: user.email || undefined,
        primaryPhone: user.phone || undefined,
    };

    // Pass plain-text password — Logto stores it with passwordEncryptionMethod=Plain
    // and auto-bcrypts on first login.
    if (user.password) {
        body.password = user.password;
        body.passwordEncryptionMethod = 'Plain';
    }

    const res = await fetch(`${ENDPOINT}/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (res.status === 422) {
        // Duplicate email/phone already in Logto — fetch existing user by email
        const detail = await res.json();
        return { skip: true, reason: detail.message || 'duplicate' };
    }

    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Logto create failed for ${user.email}: ${detail}`);
    }

    return await res.json(); // { id: 'logto_user_id', ... }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const client = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows: users } = await client.query(
    `SELECT id, name, email, phone, password
     FROM users
     WHERE logto_sub IS NULL AND account_type IN ('registered', 'shadow')
     ORDER BY created_at`
);

console.log(`Found ${users.length} users without logto_sub.${DRY_RUN ? ' (DRY RUN)' : ''}`);

if (DRY_RUN) {
    for (const u of users) {
        console.log(`  would import: ${u.email || u.phone || u.id} (has_pw=${!!u.password})`);
    }
    await client.end();
    process.exit(0);
}

const token = await getM2MToken();
console.log('M2M token acquired.\n');

let ok = 0, skipped = 0, failed = 0;

for (const user of users) {
    try {
        const result = await createLogtoUser(token, user);
        if (result.skip) {
            console.warn(`  SKIP  ${user.email || user.id}: ${result.reason}`);
            skipped++;
            continue;
        }

        // Write logto_sub back to our DB
        await client.query(
            `UPDATE users SET logto_sub = $1 WHERE id = $2`,
            [result.id, user.id]
        );
        console.log(`  OK    ${user.email || user.phone || user.id} → logto:${result.id}`);
        ok++;
    } catch (err) {
        console.error(`  FAIL  ${user.email || user.id}: ${err.message}`);
        failed++;
    }
}

await client.end();
console.log(`\nDone. ok=${ok} skipped=${skipped} failed=${failed}`);
