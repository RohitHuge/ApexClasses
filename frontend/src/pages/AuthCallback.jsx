import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { handleLogtoCallback } from '../utils/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Landing page for Logto's redirect: /auth/callback?code=...&state=...
 * Exchanges the code server-side, stores the session, then redirects.
 */
export default function AuthCallback() {
    const { setUserFromCallback } = useAuth();
    const navigate = useNavigate();
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const params = new URLSearchParams(window.location.search);
        const code  = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (error) {
            toast.error(`Login cancelled or failed: ${error}`);
            navigate('/login');
            return;
        }

        if (!code) {
            toast.error('No authorization code received');
            navigate('/login');
            return;
        }

        handleLogtoCallback(code, state)
            .then((user) => {
                setUserFromCallback(user);
                toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
                const redirectUrl = sessionStorage.getItem('logto_redirect') || '/dashboard';
                sessionStorage.removeItem('logto_redirect');
                navigate(user.role === 'admin' ? '/admin/nexus-terminal' : redirectUrl, { replace: true });
            })
            .catch((err) => {
                console.error('Auth callback error:', err);
                toast.error(err.message || 'Login failed');
                navigate('/login');
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
                <p className="text-gray-600 font-medium">Signing you in…</p>
            </div>
        </div>
    );
}
