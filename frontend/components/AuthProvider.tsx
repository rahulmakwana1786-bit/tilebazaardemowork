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
  }, [token, user, loading, dispatch]);

  return <>{children}</>;
}