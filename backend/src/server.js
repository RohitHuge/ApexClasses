import app from './app.js';
import pool from './db/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test Database connection
        await pool.connect();
        console.log('✅ Connected to PostgreSQL');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

startServer();
