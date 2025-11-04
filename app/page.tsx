"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("supabase-jwt-access");
      if (token) {
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            router.push("/profile");
          }
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleGoogleLogin = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'google',
        redirectTo: `${baseUrl}/auth/callback`
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <button
        onClick={handleGoogleLogin}
        className="bg-gray-900 text-gray-300 font-semibold py-3 px-6 rounded-lg border border-gray-700 hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center"
      >
        <Image src="/google-logo.svg" alt="Google logo" width={24} height={24} className="mr-2" />
        Log in with Google
      </button>
    </div>
  );
}
