// Usage: node scripts/seed-admin.js <email> <password> [name]
import pool from '../src/db/db.js';

const [,, email, password, name = 'Admin'] = process.argv;

if (!email || !password) {
    console.error('Usage: node scripts/seed-admin.js <email> <password> [name]');
    process.exit(1);
}

const client = await pool.connect();
try {
    const result = await client.query(
        `INSERT INTO users (id, name, email, password, role)
         VALUES (gen_random_uuid()::text, $1, $2, $3, 'admin')
         ON CONFLICT (email) DO UPDATE SET password = $3, role = 'admin', name = $1
         RETURNING id, name, email, role`,
        [name, email, password]
    );
    console.log('✅ Admin user ready:', result.rows[0]);
} catch (err) {
    console.error('❌ Failed:', err.message);
} finally {
    client.release();
    await pool.end();
}
