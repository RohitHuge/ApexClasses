import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('⚠️ Unexpected DB pool error:', err.message);
});

export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) console.warn('🐢 Slow query detected:', text.slice(0, 80), `${duration}ms`);
        return res;
    } catch (err) {
        console.error('❌ DB query error:', err.message);
        throw err;
    }
};

export default pool;
