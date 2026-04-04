import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// SSL is MANDATORY for Neon and most managed Postgres services.
// Without this, the server will crash with 'Connection terminated unexpectedly'.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Prevent background pool errors from crashing the Node process
pool.on('error', (err) => {
  console.error('Unexpected DB Pool error:', err);
});

export const query = (text, params) => pool.query(text, params);

export default pool;
