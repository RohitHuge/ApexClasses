const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchMeta() {
    const res = await fetch(`${API_BASE}/predictor/meta`);
    if (!res.ok) throw new Error('Failed to load options');
    return res.json();
}

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

export async function submitLead(payload) {
    const res = await fetch(`${API_BASE}/predictor/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save your details');
    return data;
}
