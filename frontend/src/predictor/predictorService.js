import { apiFetch } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Public (no auth) ─────────────────────────────────────────────────────────

export async function fetchMeta() {
    const res = await fetch(`${API_BASE}/predictor/meta`);
    if (!res.ok) throw new Error('Failed to load options');
    return res.json();
}

// Locked preview (3/3/2 + true counts).
export async function runPredict(payload) {
    const res = await fetch(`${API_BASE}/predictor/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Prediction failed');
    return data;
}

// ── Authenticated (account + quota) ──────────────────────────────────────────

export async function getProfile() {
    const res = await apiFetch(`${API_BASE}/predictor/profile`, { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load profile');
    return data; // { profile, price, pack }
}

// Full list for a combo. Free on re-open; otherwise consumes 1 of the quota.
export async function revealResults(payload) {
    const res = await apiFetch(`${API_BASE}/predictor/reveal`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error || 'Could not reveal results');
        err.code = data.code;          // QUOTA_EXHAUSTED
        err.profile = data.profile;
        throw err;
    }
    return data;
}

export async function listSearches() {
    const res = await apiFetch(`${API_BASE}/predictor/searches`, { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load searches');
    return data.searches;
}

export async function getSearch(id) {
    const res = await apiFetch(`${API_BASE}/predictor/searches/${id}`, { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load search');
    return data.search;
}

// ── Payment (₹99 / 15-search pack) ───────────────────────────────────────────

export async function createPayment() {
    const res = await apiFetch(`${API_BASE}/predictor/pay/create`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not start payment');
    return data; // { orderId, amount, currency, keyId, pack }
}

export async function verifyPayment(payload) {
    const res = await apiFetch(`${API_BASE}/predictor/pay/verify`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment verification failed');
    return data; // { profile }
}
