import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './order/order.route.js';

dotenv.config();

const app = express();

// Configure CORS for specific origin and headers
app.use(cors({
    origin: ['http://localhost:5173', 'https://apexclasses.org'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

export default app;
