import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// SSL is MANDATORY for Neon and most managed Postgres services.
// Without this, the server will crash with 'Connection terminated unexpectedly'.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false
  // },
  // max: 20, // Increased for concurrent load
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 10000,
});

// Prevent background pool errors from crashing the Node process
pool.on('error', (err) => {
  console.error('⚠️ UNEXPECTED DB POOL ERROR:', err.message);
});

// Robust query wrapper that handles transient connection issues
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) console.warn('🐢 Slow query:', text, `${duration}ms`);
    return res;
  } catch (error) {
    console.error('❌ DB Query Execution Error:', error.message);
    throw error;
  }
};

export default pool;
