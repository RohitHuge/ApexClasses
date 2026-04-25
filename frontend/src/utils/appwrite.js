// Appwrite has been replaced with our own JWT auth system.
// This file re-exports equivalents so any remaining imports don't break.
export { login, logout, getCurrentUser } from './auth.js';

// createJWT is no longer needed — the access token is managed by auth.js
export const createJWT = async () => {
    const { getStoredToken } = await import('./auth.js');
    return getStoredToken();
};
