import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/db.js';
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

/**
 * POST /api/auth/logto/callback
 * Receives the authorization code from the frontend after Logto redirects back.
 * Exchanges it for tokens, fetches userinfo, upserts our DB user, issues JWT.
 */
export const logtoCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'code is required' });

        const endpoint = process.env.LOGTO_ENDPOINT;
        const appId    = process.env.LOGTO_APP_ID;
        const secret   = process.env.LOGTO_APP_SECRET;
        const redirect = `${process.env.FRONTEND_URL}/auth/callback`;

        if (!endpoint || !appId || !secret) {
            return res.status(503).json({ error: 'Logto not configured on this server' });
        }

        // 1 — Exchange code for tokens
        const tokenRes = await fetch(`${endpoint}/oidc/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type:   'authorization_code',
                code,
                redirect_uri:  redirect,
                client_id:     appId,
                client_secret: secret,
            }),
        });
        if (!tokenRes.ok) {
            const detail = await tokenRes.text();
            console.error('Logto token exchange failed:', detail);
            return res.status(401).json({ error: 'Logto token exchange failed' });
        }
        const tokens = await tokenRes.json();

        // 2 — Fetch userinfo
        const infoRes = await fetch(`${endpoint}/oidc/userinfo`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (!infoRes.ok) return res.status(401).json({ error: 'Failed to fetch Logto userinfo' });
        const info = await infoRes.json();

        // 3 — Upsert our DB user
        const user = await AuthModel.upsertUserByLogtoSub({
            logtoSub:  info.sub,
            email:     info.email     || null,
            name:      info.name      || info.email?.split('@')[0] || 'Student',
            phone:     info.phone_number || null,
            avatarUrl: info.picture   || null,
        });

        // 4 — Issue our JWT + refresh cookie
        const accessToken = signAccess(user);
        const refreshToken = uuidv4();
        const refreshExpires = new Date(Date.now() + REFRESH_EXPIRES_MS);
        await AuthModel.setRefreshToken(user.id, refreshToken, refreshExpires);
        setRefreshCookie(res, refreshToken);

        const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        res.json({ success: true, accessToken, user: safe });
    } catch (err) {
        console.error('Logto callback error:', err.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

/**
 * POST /api/auth/merge-shadow  (auth required — called after Google/Logto login)
 * Transfers all predictor data from a shadow account to the now-registered user,
 * then deletes the shadow row.
 */
export const mergeShadow = async (req, res) => {
    try {
        const registeredUserId = req.user.id;
        const phoneStr = String(req.body?.phone || '').replace(/\s+/g, '');
        const { deviceToken } = req.body || {};

        if (!phoneStr || !deviceToken) {
            return res.status(400).json({ error: 'phone and deviceToken are required' });
        }

        // Verify shadow ownership
        const shadowRes = await query(
            `SELECT id FROM users
             WHERE phone = $1 AND account_type = 'shadow' AND shadow_device_token = $2 AND shadow_expires_at > NOW()`,
            [phoneStr, deviceToken]
        );
        const shadow = shadowRes.rows[0];
        if (!shadow) {
            return res.status(404).json({ error: 'Shadow account not found or expired' });
        }

        const shadowId = shadow.id;

        // Transfer predictor_profiles quota
        await query(
            `UPDATE predictor_profiles SET
               searches_limit      = predictor_profiles.searches_limit      + COALESCE(s.searches_limit, 0),
               searches_used       = predictor_profiles.searches_used       + COALESCE(s.searches_used, 0),
               rank_searches_limit = predictor_profiles.rank_searches_limit + COALESCE(s.rank_searches_limit, 0),
               rank_searches_used  = predictor_profiles.rank_searches_used  + COALESCE(s.rank_searches_used, 0)
             FROM predictor_profiles s
             WHERE predictor_profiles.user_id = $1 AND s.user_id = $2`,
            [registeredUserId, shadowId]
        );

        // Count what we're transferring for the response
        const countRes = await query(
            `SELECT
               (SELECT COUNT(*) FROM predictor_searches WHERE user_id = $1) AS searches,
               (SELECT COUNT(*) FROM predictor_payments  WHERE user_id = $1) AS payments`,
            [shadowId]
        );
        const transferred = countRes.rows[0];

        // Re-parent searches and payments
        await query(`UPDATE predictor_searches SET user_id = $1 WHERE user_id = $2`, [registeredUserId, shadowId]);
        await query(`UPDATE predictor_payments  SET user_id = $1 WHERE user_id = $2`, [registeredUserId, shadowId]);

        // Delete shadow user (cascade deletes its predictor_profiles row)
        await query(`DELETE FROM users WHERE id = $1`, [shadowId]);

        res.json({
            success: true,
            transferred: {
                searches: Number(transferred.searches),
                payments: Number(transferred.payments),
            },
        });
    } catch (err) {
        console.error('Merge shadow error:', err.message);
        res.status(500).json({ error: 'Failed to merge shadow account' });
    }
};
