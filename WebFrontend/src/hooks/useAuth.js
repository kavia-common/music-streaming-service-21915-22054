import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken, http } from "../api/client";

// Keys for localStorage
const TOKEN_KEY = "auth.token";
const USER_KEY = "auth.user";

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides:
 * - token state persisted in localStorage
 * - user state (optional, minimal scaffold)
 * - login/logout/register methods (API path placeholders)
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync axios header when token changes
  useEffect(() => {
    setAuthToken(token || null);
  }, [token]);

  // Persist to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // PUBLIC_INTERFACE
  const login = useCallback(async (email, password) => {
    /**
     * Login against BackendAPI:
     * - POST /api/auth/login (proxy -> BackendAPI /auth/login)
     * - Expect token in { token } (primary) or { access_token } (fallback)
     * - Normalize to our single 'token' concept for storage and Authorization header
     */
    setLoading(true);
    try {
      const data = await http.post("/api/auth/login", { email, password });
      const receivedToken = data?.token || data?.access_token || "";
      if (!receivedToken) {
        throw { message: "No token returned from server", data, status: 500 };
      }
      setToken(receivedToken);
      setUser(data?.user || null);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // PUBLIC_INTERFACE
  const register = useCallback(async (email, password, username) => {
    setLoading(true);
    try {
      await http.post("/api/auth/register", { email, password, username });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // PUBLIC_INTERFACE
  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
      register,
    }),
    [token, user, loading, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to consume the auth context */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
