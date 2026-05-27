"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/slices/authSlice";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but haven't fetched the user yet
    if (token && !user && !loading) {
      dispatch(getProfile());
    }

    // Clean up legacy admin tokens from localStorage so new tabs ask for login correctly
    if (user?.role === 'admin' && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [token, user, loading, dispatch]);

  useEffect(() => {
    const handleUnload = () => {
      if (user?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tilebazaardemowork-production.up.railway.app';
        const url = `${baseUrl}/api/auth/logout`;
        const payload = JSON.stringify({ email: user.email });
        
        // Use sendBeacon for reliable delivery during page unload
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        
        // We do NOT clear tokens here, because this event fires on page reload too!
        // Using sessionStorage in the app ensures tokens are cleared when the tab actually closes.
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [user]);

  return <>{children}</>;
}