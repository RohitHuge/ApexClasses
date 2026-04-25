const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'apex_token';
const USER_KEY = 'apex_user';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
const storeSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
                clearSession();
                processQueue(null);
                window.location.href = '/login';
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
