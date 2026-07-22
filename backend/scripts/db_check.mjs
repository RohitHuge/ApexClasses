import pg from 'pg';

async function check(label, connStr, ssl) {
    const pool = new pg.Pool({ connectionString: connStr, ssl, connectionTimeoutMillis: 10000 });
    try {
        console.log(`\n${'='.repeat(50)}\n${label}\n${'='.repeat(50)}`);

        const tables = await pool.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
        );
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

        const rc = await pool.query(`SELECT COUNT(*) FROM rank_cutoffs`).catch(() => ({ rows: [{ count: 'MISSING' }] }));
        console.log('rank_cutoffs rows:', rc.rows[0].count);

        const pcols = await pool.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_schema='public' AND table_name='predictor_profiles' ORDER BY ordinal_position`);
        console.log('predictor_profiles cols:', pcols.rows.map(r => r.column_name).join(', '));

        const migs = await pool.query(
            `SELECT migration_name FROM _prisma_migrations ORDER BY finished_at ASC`
        ).catch(() => ({ rows: [] }));
        console.log('Migrations applied:');
        migs.rows.forEach(r => console.log(' -', r.migration_name));

    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await pool.end();
    }
}

await check(
    'NEON (dev)',
    'postgresql://neondb_owner:npg_srxj52QtpUkR@ep-fragrant-truth-az2tbp58.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    { rejectUnauthorized: false }
);

await check(
    'VPS PROD (apex_db)',
    'postgres://postgres:strongpassword@82.180.144.69:5432/apex_db',
    false
);
