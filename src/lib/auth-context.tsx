"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

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
};

const AuthCtx = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        setUser(await res.json());
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (redirectTo?: string) => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    document.cookie = "mh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = redirectTo ?? "/dashboard/pelanggan/login";
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthCtx.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
