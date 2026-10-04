import type { Role } from "./types";

const TOKEN_KEY = "inflame_admin_token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const RANK: Role[] = ["SuperAdmin", "Admin", "Employee"];

export function decodeToken(token: string): { role: Role; userId?: string; email?: string; exp?: number } | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const raw = payload.role ?? payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roles: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const role = RANK.find((r) => roles.includes(r));
    if (!role) return null;
    return { role, userId: payload.sub ?? payload.nameid, email: payload.email, exp: payload.exp };
  } catch {
    return null;
  }
}

function extractMessage(data: unknown, status: number): string {
  if (typeof data === "string" && data) return data;
  if (data && typeof data === "object") {
    const d = data as { message?: string; error?: string; title?: string; errors?: Record<string, string[]> };
    if (d.message) return d.message;
    if (d.error) return d.error;
    if (d.errors) {
      const first = Object.values(d.errors)[0];
      if (first?.[0]) return first[0];
    }
    if (d.title) return d.title;
  }
  if (status === 403) return "You don't have permission to do that.";
  if (status === 429) return "Too many requests. Please wait a moment.";
  return `Request failed (${status})`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (typeof init.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (res.status === 401 && token && !path.includes("/account/login")) {
    tokenStore.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  const flagged = typeof data === "object" && data !== null && (data as { success?: boolean }).success === false;
  if (!res.ok || flagged) throw new ApiError(extractMessage(data, res.status), res.status);
  return data as T;
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) }),
  del: <T>(p: string) => request<T>(p, { method: "DELETE" }),
  form: <T>(p: string, form: FormData, method: "POST" | "PUT" = "POST") => request<T>(p, { method, body: form }),
};

export function qs(params: Record<string, string | number | undefined | null>): string {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}