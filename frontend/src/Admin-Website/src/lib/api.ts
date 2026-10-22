import type { Role } from "./types";

/*
 * tokenStore is intentionally a no-op.
 *
 * The JWT is now stored in an httpOnly cookie set
 * by the backend on login/2FA. JavaScript cannot
 * read httpOnly cookies, so localStorage is no
 * longer used. The browser sends the cookie
 * automatically on every same-origin request.
 *
 * Kept as a stub so any existing imports compile
 * without changes.
 *
 * @deprecated — do not call set/get/clear directly.
 */
export const tokenStore = {
  get: (): string | null => null,
  set: (_token: string): void => undefined,
  clear: (): void => undefined,
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const RANK: Role[] = [
  "SuperAdmin",
  "Admin",
  "Employee",
];

/**
 * @deprecated No longer needed now that the JWT
 * lives in an httpOnly cookie and cannot be read
 * by JavaScript. Kept for backward compatibility.
 */
export function decodeToken(
  token: string
): {
  role: Role;
  userId?: string;
  email?: string;
  exp?: number;
} | null {
  try {
    const parts = token.split(".");

    if (parts.length < 2 || !parts[1]) {
      return null;
    }

    let payloadPart = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (payloadPart.length % 4 !== 0) {
      payloadPart += "=";
    }

    const payload = JSON.parse(
      atob(payloadPart)
    );

    const rawRole =
      payload.role ??
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];

    const roles: string[] =
      Array.isArray(rawRole)
        ? rawRole
        : rawRole
          ? [rawRole]
          : [];

    const role = RANK.find((r) =>
      roles.includes(r)
    );

    if (!role) {
      return null;
    }

    return {
      role,
      userId:
        payload.sub ??
        payload.nameid ??
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      email:
        payload.email ??
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

function extractMessage(
  data: unknown,
  status: number
): string {
  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data;
  }

  if (
    data &&
    typeof data === "object"
  ) {
    const d = data as {
      message?: string;
      error?: string;
      title?: string;
      errors?: Record<
        string,
        string[]
      >;
    };

    if (d.message) {
      return d.message;
    }

    if (d.error) {
      return d.error;
    }

    if (d.errors) {
      const first =
        Object.values(d.errors)[0];

      if (first?.[0]) {
        return first[0];
      }
    }

    if (d.title) {
      return d.title;
    }
  }

  if (status === 401) {
    return "Unauthorised";
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment.";
  }

  return `Request failed (${status})`;
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(
    init.headers
  );

  if (
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `/api${path}`,
      {
        ...init,
        headers,
        /*
         * Ensures the browser attaches the
         * httpOnly auth cookie on every request,
         * including cross-origin scenarios.
         */
        credentials: "include",
      }
    );
  } catch {
    throw new ApiError(
      "Cannot reach the server. Is the API running?",
      0
    );
  }

  const text =
    await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  /*
   * IMPORTANT:
   *
   * Redirect to /login on 401 ONLY if:
   *
   * 1. API returned 401
   * 2. This wasn't the login endpoint itself
   *
   * The browser's httpOnly cookie acts as the
   * session indicator — we no longer gate this
   * on a localStorage token.
   */
  if (
    response.status === 401 &&
    !path.includes(
      "/account/login"
    )
  ) {
    if (
      typeof window !==
      "undefined"
    ) {
      window.location.href =
        "/login";
    }
  }

  const flagged =
    typeof data === "object" &&
    data !== null &&
    (
      data as {
        success?: boolean;
      }
    ).success === false;

  if (!response.ok || flagged) {
    throw new ApiError(
      extractMessage(
        data,
        response.status
      ),
      response.status
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) =>
    request<T>(path),

  post: <T>(
    path: string,
    body?: unknown
  ) =>
    request<T>(path, {
      method: "POST",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    }),

  put: <T>(
    path: string,
    body?: unknown
  ) =>
    request<T>(path, {
      method: "PUT",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    }),

  del: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),

  form: <T>(
    path: string,
    form: FormData,
    method: "POST" | "PUT" = "POST"
  ) =>
    request<T>(path, {
      method,
      body: form,
    }),
};

export function qs(
  params: Record<
    string,
    | string
    | number
    | undefined
    | null
  >
): string {
  const search =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        search.set(
          key,
          String(value)
        );
      }
    }
  );

  const result =
    search.toString();

  return result
    ? `?${result}`
    : "";
}