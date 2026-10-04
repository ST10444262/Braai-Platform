import type { Role } from "./types";

const TOKEN_KEY = "inflame_admin_token";

export const tokenStore = {
  get: () =>
    typeof window === "undefined"
      ? null
      : localStorage.getItem(TOKEN_KEY),

  set: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
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

  /*
   * Capture the token BEFORE the request.
   *
   * This is important because a 401 should
   * only redirect to /login if this request
   * was actually authenticated.
   */
  const tokenAtRequestStart =
    tokenStore.get();

  if (tokenAtRequestStart) {
    headers.set(
      "Authorization",
      `Bearer ${tokenAtRequestStart}`
    );
  }

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
   * Redirect ONLY if:
   *
   * 1. API returned 401
   * 2. This request started with a token
   * 3. This wasn't the login endpoint
   *
   * Therefore an anonymous 401 does NOT
   * redirect the browser.
   */
  if (
    response.status === 401 &&
    Boolean(tokenAtRequestStart) &&
    !path.includes(
      "/account/login"
    )
  ) {
    tokenStore.clear();

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