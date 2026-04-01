import http from 'http';
import app from './app.js';
import pool from './db/db.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
    try {
        // Test Database connection
        await pool.connect();
        console.log('✅ Connected to PostgreSQL');

        // Initialize Socket.io
        initSocket(server);
        console.log('🔌 Socket.io initialized');

        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

startServer();
