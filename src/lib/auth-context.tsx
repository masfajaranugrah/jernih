"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getToken, decodeJwtToken } from "./auth";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  mitra?: { id: string; storeName: string; isVerified: boolean; logo?: string } | null;
  slug?: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
  clearAuthCache: () => void;
};

const AuthCtx = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  clearAuthCache: () => {},
});

// ── Module-level cache ──
// Menghindari request /api/auth/me berulang dalam window yang sama.
let authCache: { user: AuthUser; timestamp: number } | null = null;
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 menit

// Name/email bersumber dari JWT token; field lain (phone, avatar, mitra) dari API.
function mergeTokenUser(data: AuthUser): AuthUser {
  if (!data) return data;
  const decoded = decodeJwtToken(getToken() ?? "");
  if (!decoded) return data;
  return {
    ...data,
    id: decoded.id ?? data.id,
    name: decoded.name || data.name,
    email: decoded.email || data.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // ⚡ Skip API call kalau tidak ada cookie sama sekali
    const token = getToken();
    if (!token) {
      authCache = null;
      setLoading(false);
      setUser(null);
      return;
    }

    // 🪙 Minimal user dari JWT — name/email tetap tampil meski API gagal
    const decoded = decodeJwtToken(token);
    const tokenUser: AuthUser = decoded?.id
      ? {
          id: decoded.id,
          name: decoded.name || "",
          email: decoded.email || "",
          role: decoded.role || "",
        }
      : null;

    // 📦 Gunakan cache kalau masih fresh
    if (authCache && Date.now() - authCache.timestamp < AUTH_CACHE_TTL) {
      setUser(authCache.user);
      setLoading(false);
      return;
    }

    // 🌐 Fetch dari API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch("/api/auth/me", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: AuthUser = await res.json();
        const merged = mergeTokenUser(data);
        authCache = { user: merged, timestamp: Date.now() };
        setUser(merged);
      } else {
        authCache = null;
        setUser(tokenUser);
      }
    } catch {
      authCache = null;
      setUser(tokenUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAuthCache = useCallback(() => {
    authCache = null;
  }, []);

  const logout = useCallback(async (redirectTo?: string) => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    document.cookie = "mh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    authCache = null;
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = redirectTo ?? "/dashboard/pelanggan/login";
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthCtx.Provider value={{ user, loading, refresh, logout, clearAuthCache }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
