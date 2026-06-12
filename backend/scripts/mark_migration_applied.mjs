import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: process.env.DIRECT_URL });
await c.connect();
const r = await c.query(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = '_prisma_migrations'`);
console.log('Indexes:', r.rows);
// try insert with simple WHERE NOT EXISTS
const exists = await c.query(`SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260611000000_add_analytics_events'`);
if (exists.rows.length) {
  console.log('Already marked as applied.');
} else {
  await c.query(`INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count) VALUES (gen_random_uuid()::text, '', '20260611000000_add_analytics_events', NOW(), 1)`);
  console.log('Marked as applied.');
}
await c.end();
