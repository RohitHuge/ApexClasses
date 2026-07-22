import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, getStoredToken, login as authLogin, logout as authLogout, register as authRegister, predictorGuest as authGuest, predictorShadowGuest as authShadowGuest, clearSession, redirectToLogto } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getStoredUser();
        const storedToken = getStoredToken();
        if (storedUser && storedToken) setUser(storedUser);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const u = await authLogin(email, password);
        setUser(u);
        return u;
    };

    const register = async (name, email, phone, password) => {
        const u = await authRegister(name, email, phone, password);
        setUser(u);
        return u;
    };

    const loginAsGuest = async (name, phone) => {
        const u = await authGuest(name, phone);
        setUser(u);
        return u;
    };

    const loginAsShadow = async (phone) => {
        const u = await authShadowGuest(phone);
        setUser(u);
        return u;
    };

    // Called from AuthCallback after Logto code exchange completes.
    // The session is already stored in localStorage at this point — just sync state.
    const setUserFromCallback = (u) => setUser(u);

    // Redirects browser to Logto. hint='google' skips Logto UI → direct Google OAuth.
    const loginWithLogto = (hint = '') => {
        if (window.location.pathname !== '/college-predictor') {
            sessionStorage.setItem('logto_redirect', window.location.pathname);
        }
        redirectToLogto(hint);
    };

    const logout = async () => {
        await authLogout();
        setUser(null);
    };

    const isAdmin  = user?.role === 'admin';
    const isGuest  = !!user && !user.email;
    const isShadow = !!user?.isShadow;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, loginAsGuest, loginAsShadow, loginWithLogto, setUserFromCallback, isAdmin, isGuest, isShadow }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
