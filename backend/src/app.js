import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import orderRoutes from './order/order.route.js';
import authRoutes from './auth/auth.routes.js';
import slotsRoutes from './slots/slots.routes.js';
import * as PaymentController from './order/payment.controller.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

dotenv.config();

const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://apexclasses.org'];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(generalLimiter);

// ── Razorpay webhook — MUST be before express.json() to get raw body ────────
app.post('/api/orders/payment/webhook', express.raw({ type: 'application/json' }), PaymentController.handleWebhook);

app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/slots', slotsRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
