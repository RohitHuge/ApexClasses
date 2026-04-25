import http from 'http';
import app from './app.js';
import pool from './db/db.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
    try {
        // Test DB connection and immediately release back to pool
        const client = await pool.connect();
        client.release();
        console.log('✅ Connected to PostgreSQL');

        initSocket(server);
        console.log('🔌 Socket.io initialized');

        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Startup error:', err.message);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
        await pool.end();
        console.log('✅ DB pool closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
