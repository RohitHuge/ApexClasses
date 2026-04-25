import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as AuthModel from './auth.model.js';
import * as EmailService from '../email/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-set-in-env';
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const signAccess = (user) =>
    jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

const setRefreshCookie = (res, token) => {
    res.cookie('apex_refresh', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_EXPIRES_MS,
        path: '/'
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email and password are required' });
        }
        const existing = await AuthModel.findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const user = await AuthModel.createUser({ name, email, phone, password });

        const accessToken = signAccess(user);
        const refreshToken = uuidv4();
        const refreshExpires = new Date(Date.now() + REFRESH_EXPIRES_MS);
        await AuthModel.setRefreshToken(user.id, refreshToken, refreshExpires);
        setRefreshCookie(res, refreshToken);

        EmailService.sendWelcomeEmail(user);

        res.status(201).json({ success: true, accessToken, user });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const user = await AuthModel.findUserByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Migrated user (Appwrite era) — no password set yet
        if (!user.password) {
            return res.status(403).json({
                error: 'Please set your password first. Use "Forgot Password" to receive a reset link.',
                code: 'PASSWORD_NOT_SET'
            });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = signAccess(user);
        const refreshToken = uuidv4();
        const refreshExpires = new Date(Date.now() + REFRESH_EXPIRES_MS);
        await AuthModel.setRefreshToken(user.id, refreshToken, refreshExpires);
        setRefreshCookie(res, refreshToken);

        const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        res.json({ success: true, accessToken, user: safe });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const refresh = async (req, res) => {
    try {
        const token = req.cookies?.apex_refresh;
        if (!token) return res.status(401).json({ error: 'No refresh token' });

        const user = await AuthModel.findUserByRefreshToken(token);
        if (!user) {
            res.clearCookie('apex_refresh');
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // Rotate refresh token
        const newRefreshToken = uuidv4();
        const refreshExpires = new Date(Date.now() + REFRESH_EXPIRES_MS);
        await AuthModel.setRefreshToken(user.id, newRefreshToken, refreshExpires);
        setRefreshCookie(res, newRefreshToken);

        const accessToken = signAccess(user);
        const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        res.json({ success: true, accessToken, user: safe });
    } catch (err) {
        console.error('Refresh error:', err.message);
        res.status(500).json({ error: 'Token refresh failed' });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.apex_refresh;
        if (token) {
            const user = await AuthModel.findUserByRefreshToken(token);
            if (user) await AuthModel.clearRefreshToken(user.id);
        }
        res.clearCookie('apex_refresh');
        res.json({ success: true });
    } catch (err) {
        console.error('Logout error:', err.message);
        res.status(500).json({ error: 'Logout failed' });
    }
};

export const me = async (req, res) => {
    try {
        const user = await AuthModel.findUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        res.json({ success: true, user: safe });
    } catch (err) {
        console.error('Me error:', err.message);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'email is required' });

        const user = await AuthModel.findUserByEmail(email);
        // Always return success to prevent email enumeration
        if (!user) return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });

        const token = uuidv4();
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await AuthModel.setResetToken(email, token, expires);

        const resetUrl = `https://apexclasses.org/reset-password?token=${token}`;
        EmailService.sendPasswordResetEmail(user, resetUrl);

        res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err.message);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'token and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await AuthModel.findUserByResetToken(token);
        if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

        await AuthModel.setPassword(user.id, password);

        res.json({ success: true, message: 'Password set successfully. You can now log in.' });
    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
