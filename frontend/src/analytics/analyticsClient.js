// Lightweight fire-and-forget client. The backend endpoint is a 202-no-body
// POST; we intentionally don't await or surface errors. The transport can be
// swapped (Plausible/PostHog/GA) by replacing this file.

// VITE_API_URL already includes the `/api` prefix (e.g. http://localhost:5000/api),
// matching predictorService / auth. Don't add another `/api` segment here.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const buffer = [];
const FLUSH_MS = 5000;
let timer = null;

const flush = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!buffer.length) return;
    const batch = buffer.splice(0, buffer.length);
    for (const evt of batch) {
        fetch(`${API_BASE}/analytics/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evt),
            keepalive: true,
        }).catch(() => {});
    }
};

const schedule = () => {
    if (timer) return;
    timer = setTimeout(flush, FLUSH_MS);
};

/**
 * Track an event. props are coerced to a small, safe shape server-side.
 */
export const track = (event, props) => {
    if (typeof event !== 'string' || !event) return;
    buffer.push({ event, props: props || {} });
    schedule();
};

// Flush on tab close / page hide so we don't lose the last batch.
if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
}
