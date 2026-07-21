const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'apex_token';
const USER_KEY = 'apex_user';
const SHADOW_TOKEN_KEY = 'apex_shadow_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
export const getStoredShadowToken = () => localStorage.getItem(SHADOW_TOKEN_KEY);

const storeSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const storeShadowSession = (accessToken, deviceToken, user) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SHADOW_TOKEN_KEY, deviceToken);
};

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SHADOW_TOKEN_KEY);
};

// Fetch wrapper — auto-refreshes token on 401
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (newToken) => {
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];
};

export const apiFetch = async (url, options = {}) => {
    const token = getStoredToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    let response = await fetch(url, { ...options, credentials: 'include', headers });

    if (response.status === 401) {
        if (isRefreshing) {
            // Queue subsequent calls while refresh is in progress
            return new Promise((resolve) => {
                refreshQueue.push(async (newToken) => {
                    resolve(fetch(url, {
                        ...options,
                        credentials: 'include',
                        headers: { ...headers, Authorization: `Bearer ${newToken}` },
                    }));
                });
            });
        }

        isRefreshing = true;
        try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                storeSession(data.accessToken, data.user);
                processQueue(data.accessToken);
                response = await fetch(url, {
                    ...options,
                    credentials: 'include',
                    headers: { ...headers, Authorization: `Bearer ${data.accessToken}` },
                });
            } else {
                // Cookie refresh failed — try shadow device-token refresh before giving up
                const shadowToken = getStoredShadowToken();
                const currentUser = getStoredUser();
                if (shadowToken && currentUser?.isShadow && currentUser?.phone) {
                    const shadowRes = await fetch(`${API_BASE}/predictor/shadow-refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: currentUser.phone, deviceToken: shadowToken }),
                    });
                    if (shadowRes.ok) {
                        const data = await shadowRes.json();
                        storeSession(data.accessToken, data.user);
                        processQueue(data.accessToken);
                        response = await fetch(url, {
                            ...options,
                            credentials: 'include',
                            headers: { ...headers, Authorization: `Bearer ${data.accessToken}` },
                        });
                    } else {
                        clearSession();
                        processQueue(null);
                        window.location.href = '/login';
                    }
                } else {
                    clearSession();
                    processQueue(null);
                    window.location.href = '/login';
                }
            }
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};

// ── Auth API calls ────────────────────────────────────────────────────────────

export const register = async (name, email, phone, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    storeSession(data.accessToken, data.user);
    return data.user;
};

export const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error || 'Login failed');
        err.code = data.code;
        throw err;
    }
    storeSession(data.accessToken, data.user);
    return data.user;
};

// Password-less guest login from the predictor phone panel.
// Throws with .code='ACCOUNT_EXISTS' if the phone is tied to a real account.
export const predictorGuest = async (name, phone) => {
    const res = await fetch(`${API_BASE}/predictor/guest`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error || 'Could not start your session');
        err.code = data.code;
        throw err;
    }
    storeSession(data.accessToken, data.user);
    return data.user;
};

// Phone-only shadow account — no name, no email, no password.
// deviceToken is stored in localStorage and is the only credential on this device.
// Throws with .code='ACCOUNT_EXISTS' if the phone is linked to a registered account.
export const predictorShadowGuest = async (phone) => {
    const res = await fetch(`${API_BASE}/predictor/shadow-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error || 'Could not start your session');
        err.code = data.code;
        throw err;
    }
    storeShadowSession(data.accessToken, data.deviceToken, data.user);
    return data.user;
};

// ── Logto OIDC ───────────────────────────────────────────────────────────────

/**
 * Redirects the browser to the Logto authorization endpoint.
 * Pass hint='google' to skip the Logto UI and go directly to Google OAuth
 * (requires a Google social connector configured in Logto with that connector ID).
 */
export const redirectToLogto = (hint = '') => {
    const endpoint = import.meta.env.VITE_LOGTO_ENDPOINT;
    const appId    = import.meta.env.VITE_LOGTO_APP_ID;
    if (!endpoint || !appId) {
        console.error('VITE_LOGTO_ENDPOINT / VITE_LOGTO_APP_ID not set');
        return;
    }
    const state = crypto.randomUUID();
    sessionStorage.setItem('logto_state', state);

    const params = new URLSearchParams({
        client_id:     appId,
        redirect_uri:  `${window.location.origin}/auth/callback`,
        response_type: 'code',
        scope:         'openid profile email phone',
        state,
    });
    // direct_sign_in tells Logto to skip its own UI and go straight to the connector
    if (hint === 'google') params.set('direct_sign_in', 'social:google');

    window.location.href = `${endpoint}/oidc/auth?${params}`;
};

/**
 * Called from AuthCallback.jsx — exchanges the authorization code for our JWT.
 * Validates state param to prevent CSRF.
 */
export const handleLogtoCallback = async (code, returnedState) => {
    const savedState = sessionStorage.getItem('logto_state');
    sessionStorage.removeItem('logto_state');
    if (savedState && returnedState && savedState !== returnedState) {
        throw new Error('State mismatch — possible CSRF attempt');
    }

    const res = await fetch(`${API_BASE}/auth/logto/callback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    storeSession(data.accessToken, data.user);
    return data.user;
};

export const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    clearSession();
};

export const forgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
};

export const resetPassword = async (token, password) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Reset failed');
    return data;
};

export const getCurrentUser = () => getStoredUser();
export const getToken = getStoredToken;
