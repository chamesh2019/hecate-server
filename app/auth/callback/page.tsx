'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // Check if we're in the browser
            if (typeof window === 'undefined') return;

            // First, try to get the session from Supabase (handles both code and hash-based flows)
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                router.push('/');
                return;
            }

            if (session) {
                // Store the JWT token in localStorage
                localStorage.setItem('supabase-jwt-access', session.access_token);
                router.push('/profile');
            } else {
                // If no session yet, handle the OAuth callback
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (accessToken) {
                    // Store tokens and redirect
                    localStorage.setItem('supabase-jwt-access', accessToken);
                    if (refreshToken) {
                        localStorage.setItem('supabase-jwt-refresh', refreshToken);
                    }
                    router.push('/profile');
                } else {
                    router.push('/');
                }
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#121212]">
            <div className="text-gray-300">Authenticating...</div>
        </div>
    );
}
