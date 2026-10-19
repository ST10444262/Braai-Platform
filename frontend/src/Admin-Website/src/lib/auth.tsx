"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  api,
} from "./api";

import type {
  LoginResponse,
  Me,
  Role,
} from "./types";

interface AuthCtx {
  me: Me | null;
  role: Role | null;
  isAdmin: boolean;
  ready: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<{
    requiresTwoFactor: boolean;
    requiresTwoFactorSetup?: boolean;
    userId?: string;
    twoFactorChallenge?: string;
  }>;

  verifyTwoFactor: (
    userId: string,
    code: string,
    challenge?: string,
    rememberDevice?: boolean
  ) => Promise<void>;

  setupTwoFactor: (
    challenge: string
  ) => Promise<{
    authenticatorUri: string;
    sharedKey: string;
  }>;

  finishSetupTwoFactor: (
    challenge: string,
    code: string
  ) => Promise<void>;

  logout: () => void;

  reloadMe: () => Promise<void>;
}

const Ctx =
  createContext<AuthCtx | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [me, setMe] =
    useState<Me | null>(null);

  const [role, setRole] =
    useState<Role | null>(null);

  const [ready, setReady] =
    useState(false);

  const reloadMe =
    useCallback(async () => {
      try {
        /*
         * The httpOnly cookie is sent automatically
         * by the browser. If the cookie is valid the
         * backend returns the user; if not, it returns
         * 401 which the api client handles below.
         */
        const currentUser =
          await api.get<Me>(
            "/admin/account/me"
          );

        setMe(currentUser);
        setRole(currentUser.role);
      } catch {
        /*
         * 401 or network error — treat as
         * logged out.
         */
        setMe(null);
        setRole(null);
      }
    }, []);

  useEffect(() => {
    reloadMe().finally(() => {
      setReady(true);
    });
  }, [reloadMe]);

  const login:
    AuthCtx["login"] =
    async (
      email,
      password
    ) => {
      setMe(null);
      setRole(null);

      const res =
        await api.post<LoginResponse>(
          "/admin/account/login",
          {
            email,
            password,
          }
        );

      /*
       * User must configure 2FA.
       *
       * They are NOT authenticated yet.
       */
      if (
        res.requiresTwoFactorSetup
      ) {
        setMe(null);
        setRole(null);

        return {
          requiresTwoFactor:
            false,

          requiresTwoFactorSetup:
            true,

          userId:
            res.userId ??
            undefined,

          twoFactorChallenge:
            res.twoFactorChallenge ??
            undefined,
        };
      }

      /*
       * User has 2FA enabled and
       * needs to enter their code.
       *
       * Still NOT authenticated.
       */
      if (res.requiresTwoFactor) {
        setMe(null);
        setRole(null);

        return {
          requiresTwoFactor:
            true,

          userId:
            res.userId ??
            undefined,

          twoFactorChallenge:
            res.twoFactorChallenge ??
            undefined,
        };
      }

      /*
       * Normal successful login — the backend
       * has already set the httpOnly cookie.
       * Call reloadMe() to hydrate user state
       * via GET /admin/account/me.
       */
      await reloadMe();

      return {
        requiresTwoFactor:
          false,
      };
    };

  const verifyTwoFactor:
    AuthCtx["verifyTwoFactor"] =
    async (
      userId,
      code,
      challenge,
      rememberDevice = false
    ) => {
      /*
       * Backend validates the code and sets
       * the httpOnly auth cookie on success.
       * The api call will throw an ApiError
       * if the code is invalid (non-2xx).
       */
      await api.post(
        "/admin/account/login/2fa",
        {
          userId,
          code,
          challenge,
          rememberDevice,
        }
      );

      await reloadMe();
    };

  const setupTwoFactor:
    AuthCtx["setupTwoFactor"] =
    async (challenge) => {
      const res =
        await api.post<{
          authenticatorUri:
            string;
          sharedKey: string;
        }>(
          "/admin/account/2fa/setup",
          {
            challenge,
          }
        );

      if (
        !res.authenticatorUri
      ) {
        throw new Error(
          "Failed to get setup details."
        );
      }

      return res;
    };

  const finishSetupTwoFactor:
    AuthCtx["finishSetupTwoFactor"] =
    async (
      challenge,
      code
    ) => {
      const res =
        await api.post<{
          success: boolean;
        }>(
          "/admin/account/2fa/verify",
          {
            challenge,
            code,
          }
        );

      if (!res.success) {
        throw new Error(
          "Failed to verify code."
        );
      }
    };

  const logout = () => {
    setMe(null);
    setRole(null);

    /*
     * The JWT lives in an httpOnly cookie —
     * JavaScript cannot clear it directly.
     * Call the backend logout endpoint which
     * responds with an expired Set-Cookie header
     * to instruct the browser to delete it.
     *
     * Fire-and-forget: we redirect regardless
     * of whether the request succeeds.
     */
    void api
      .post("/admin/account/logout")
      .catch(() => undefined)
      .finally(() => {
        if (
          typeof window !==
          "undefined"
        ) {
          window.location.href =
            "/login";
        }
      });
  };

  return (
    <Ctx.Provider
      value={{
        me,
        role,

        isAdmin:
          role ===
            "SuperAdmin" ||
          role === "Admin",

        ready,

        login,
        verifyTwoFactor,
        setupTwoFactor,
        finishSetupTwoFactor,
        logout,
        reloadMe,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(Ctx);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}