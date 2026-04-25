import pool from './db.js';

const migrate = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Auth fields on users
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_expires TIMESTAMPTZ`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ`);

        // Generate reset tokens for all existing users (Appwrite migrated users have no password)
        await client.query(`
            UPDATE users
            SET reset_token = gen_random_uuid()::text,
                reset_token_expires = NOW() + INTERVAL '30 days'
            WHERE password IS NULL AND reset_token IS NULL
        `);

        // Dynamic slots table
        await client.query(`
            CREATE TABLE IF NOT EXISTS slots (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                product_id VARCHAR(50) NOT NULL,
                slot_time TIMESTAMPTZ NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 1,
                booked INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT true,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // slot_id FK on orders
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES slots(id)`);

        // Performance indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_payment_order_id ON orders(payment_order_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_product_type ON orders(product_type)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_slots_product_id ON slots(product_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_slots_slot_time ON slots(slot_time)`);

        await client.query('COMMIT');
        console.log('✅ Migration complete');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e.message);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
};

migrate();
