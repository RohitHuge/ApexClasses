import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './order/order.route.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

export default app;
