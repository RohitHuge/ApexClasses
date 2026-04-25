import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, getStoredToken, login as authLogin, logout as authLogout, register as authRegister, clearSession } from '../utils/auth';

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

    const logout = async () => {
        await authLogout();
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
