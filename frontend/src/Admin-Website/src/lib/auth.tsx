"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, decodeToken, tokenStore } from "./api";
import type { LoginResponse, Me, Role } from "./types";

interface AuthCtx {
  me: Me | null;
  role: Role | null;
  isAdmin: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean; userId?: string }>;
  verifyTwoFactor: (userId: string, code: string) => Promise<void>;
  logout: () => void;
  reloadMe: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  const reloadMe = useCallback(async () => {
    const token = tokenStore.get();
    const decoded = token ? decodeToken(token) : null;
    if (!token || !decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      tokenStore.clear();
      setMe(null);
      setRole(null);
      return;
    }
    setRole(decoded.role);
    try {
      setMe(await api.get<Me>("/admin/account/me"));
    } catch {
      // /me not available yet: fall back to what the token tells us
      setMe({ staffId: null, email: decoded.email ?? "", fullName: decoded.email ?? "Staff", role: decoded.role, twoFactorEnabled: false });
    }
  }, []);

  useEffect(() => {
    reloadMe().finally(() => setReady(true));
  }, [reloadMe]);

  const login: AuthCtx["login"] = async (email, password) => {
    const res = await api.post<LoginResponse>("/admin/account/login", { email, password });
    if (res.requiresTwoFactor) return { requiresTwoFactor: true, userId: res.userId ?? undefined };
    if (!res.token) throw new Error("Login failed.");
    tokenStore.set(res.token);
    await reloadMe();
    return { requiresTwoFactor: false };
  };

  const verifyTwoFactor: AuthCtx["verifyTwoFactor"] = async (userId, code) => {
    const res = await api.post<{ token?: string }>("/admin/account/login/2fa", { userId, code });
    if (!res.token) throw new Error("Verification failed.");
    tokenStore.set(res.token);
    await reloadMe();
  };

  const logout = () => {
    tokenStore.clear();
    setMe(null);
    setRole(null);
    window.location.href = "/login";
  };

  return (
    <Ctx.Provider
      value={{ me, role, isAdmin: role === "SuperAdmin" || role === "Admin", ready, login, verifyTwoFactor, logout, reloadMe }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}