import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { http } from "./api";
import { DEMO_USER, isDemoModeEnabled } from "./demoMode";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (isDemoModeEnabled()) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }
    try {
      const { data } = await http.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    if (isDemoModeEnabled()) {
      setUser(DEMO_USER);
      window.location.href = "/";
      return;
    }
    try {
      await http.post("/auth/logout");
    } catch {}
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, refresh: checkAuth, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
