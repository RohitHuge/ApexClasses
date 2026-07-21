/**
 * Deletes expired shadow accounts (account_type = 'shadow', shadow_expires_at < NOW()).
 * Safe to run daily via cron — idempotent and read-only until it finds expired rows.
 *
 * Usage:
 *   node backend/scripts/cleanup_shadow_accounts.mjs
 *   node backend/scripts/cleanup_shadow_accounts.mjs --dry-run
 */

import 'dotenv/config';
import pg from 'pg';

const DRY_RUN = process.argv.includes('--dry-run');
const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

await client.connect();

const countRes = await client.query(
    `SELECT COUNT(*) AS n FROM users WHERE account_type = 'shadow' AND shadow_expires_at < NOW()`
);
const count = Number(countRes.rows[0].n);

if (count === 0) {
    console.log('No expired shadow accounts found.');
} else if (DRY_RUN) {
    console.log(`[DRY RUN] Would delete ${count} expired shadow account(s).`);
} else {
    const del = await client.query(
        `DELETE FROM users WHERE account_type = 'shadow' AND shadow_expires_at < NOW()`
    );
    console.log(`Deleted ${del.rowCount} expired shadow account(s).`);
}

await client.end();
