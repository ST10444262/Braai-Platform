import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { tokenStore } from "@/lib/api";
import { futureExp, makeToken } from "../helpers/testUtils";

jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return { ...actual, api: { get: jest.fn(), post: jest.fn() } };
});
import { api } from "@/lib/api";
const get = api.get as jest.Mock;
const post = api.post as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;
const adminToken = () => makeToken({ role: "Admin", email: "boss@inflame.co.za", exp: futureExp() });

async function setup() {
  const hook = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  return hook;
}

let errSpy: jest.SpyInstance;
beforeEach(() => {
  jest.resetAllMocks();
  // logout() assigns window.location.href, which jsdom reports via console.error
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe("useAuth", () => {
  it("throws outside the provider", () => {
    expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used inside AuthProvider");
  });
});

describe("AuthProvider – initial load", () => {
  it("is ready and signed out when there is no token", async () => {
    const { result } = await setup();
    expect(result.current.role).toBeNull();
    expect(result.current.me).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(get).not.toHaveBeenCalled();
  });

  it("loads /me for a valid token", async () => {
    tokenStore.set(adminToken());
    get.mockResolvedValue({ staffId: "s1", email: "boss@inflame.co.za", fullName: "The Boss", role: "Admin", twoFactorEnabled: true, receiveQuoteEmails: false });
    const { result } = await setup();
    expect(get).toHaveBeenCalledWith("/admin/account/me");
    expect(result.current.role).toBe("Admin");
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.me?.fullName).toBe("The Boss");
  });

  it("falls back to token details when /me fails", async () => {
    tokenStore.set(adminToken());
    get.mockRejectedValue(new Error("404"));
    const { result } = await setup();
    expect(result.current.me).toMatchObject({ staffId: null, email: "boss@inflame.co.za", fullName: "boss@inflame.co.za", role: "Admin" });
  });

  it("clears an expired token", async () => {
    tokenStore.set(makeToken({ role: "Admin", exp: Math.floor(Date.now() / 1000) - 10 }));
    const { result } = await setup();
    expect(result.current.role).toBeNull();
    expect(tokenStore.get()).toBeNull();
  });

  it("clears a token with no recognised role", async () => {
    tokenStore.set(makeToken({ role: "Guest", exp: futureExp() }));
    const { result } = await setup();
    expect(result.current.role).toBeNull();
    expect(tokenStore.get()).toBeNull();
  });

  it.each([
    ["SuperAdmin", true],
    ["Admin", true],
    ["Employee", false],
  ] as const)("isAdmin for %s is %s", async (role, expected) => {
    tokenStore.set(makeToken({ role, exp: futureExp() }));
    get.mockResolvedValue({ staffId: "s", email: "e", fullName: "n", role, twoFactorEnabled: false, receiveQuoteEmails: false });
    const { result } = await setup();
    expect(result.current.isAdmin).toBe(expected);
  });
});

describe("AuthProvider – login", () => {
  it("stores the token and reloads the profile on success", async () => {
    post.mockResolvedValue({ success: true, requiresTwoFactor: false, token: adminToken() });
    get.mockResolvedValue({ staffId: "s1", email: "x", fullName: "X", role: "Admin", twoFactorEnabled: false, receiveQuoteEmails: false });
    const { result } = await setup();
    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "pw");
    });
    expect(post).toHaveBeenCalledWith("/admin/account/login", { email: "a@b.co", password: "pw" });
    expect(res).toEqual({ requiresTwoFactor: false });
    expect(tokenStore.get()).not.toBeNull();
    expect(result.current.role).toBe("Admin");
  });

  it("reports that 2FA setup is required", async () => {
    post.mockResolvedValue({ requiresTwoFactorSetup: true, requiresTwoFactor: false, userId: "u1", twoFactorChallenge: "ch" });
    const { result } = await setup();
    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "pw");
    });
    expect(res).toEqual({ requiresTwoFactor: false, requiresTwoFactorSetup: true, userId: "u1", twoFactorChallenge: "ch" });
    expect(tokenStore.get()).toBeNull();
  });

  it("reports that a 2FA code is required", async () => {
    post.mockResolvedValue({ requiresTwoFactor: true, userId: "u1", twoFactorChallenge: "ch" });
    const { result } = await setup();
    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "pw");
    });
    expect(res).toEqual({ requiresTwoFactor: true, userId: "u1", twoFactorChallenge: "ch" });
  });

  it("throws when no token comes back", async () => {
    post.mockResolvedValue({ requiresTwoFactor: false });
    const { result } = await setup();
    await expect(result.current.login("a", "b")).rejects.toThrow("Login failed.");
  });

  it("propagates API errors", async () => {
    post.mockRejectedValue(new Error("Invalid credentials"));
    const { result } = await setup();
    await expect(result.current.login("a", "b")).rejects.toThrow("Invalid credentials");
  });
});

describe("AuthProvider – two-factor", () => {
  it("verifyTwoFactor posts the code and stores the token", async () => {
    post.mockResolvedValue({ token: adminToken() });
    get.mockResolvedValue({ staffId: "s1", email: "x", fullName: "X", role: "Admin", twoFactorEnabled: true, receiveQuoteEmails: false });
    const { result } = await setup();
    await act(async () => {
      await result.current.verifyTwoFactor("u1", "123456", "ch", true);
    });
    expect(post).toHaveBeenCalledWith("/admin/account/login/2fa", { userId: "u1", code: "123456", challenge: "ch", rememberDevice: true });
    expect(tokenStore.get()).not.toBeNull();
  });

  it("verifyTwoFactor defaults rememberDevice to false and throws without a token", async () => {
    post.mockResolvedValue({});
    const { result } = await setup();
    await expect(result.current.verifyTwoFactor("u1", "1", "ch")).rejects.toThrow("Verification failed.");
    expect(post).toHaveBeenCalledWith("/admin/account/login/2fa", expect.objectContaining({ rememberDevice: false }));
  });

  it("setupTwoFactor returns the authenticator details", async () => {
    post.mockResolvedValue({ authenticatorUri: "otpauth://x", sharedKey: "KEY" });
    const { result } = await setup();
    await expect(result.current.setupTwoFactor("ch")).resolves.toEqual({ authenticatorUri: "otpauth://x", sharedKey: "KEY" });
    expect(post).toHaveBeenCalledWith("/admin/account/2fa/setup", { challenge: "ch" });
  });

  it("setupTwoFactor throws when the URI is missing", async () => {
    post.mockResolvedValue({});
    const { result } = await setup();
    await expect(result.current.setupTwoFactor("ch")).rejects.toThrow("Failed to get setup details.");
  });

  it("finishSetupTwoFactor resolves on success and throws on failure", async () => {
    const { result } = await setup();
    post.mockResolvedValueOnce({ success: true });
    await expect(result.current.finishSetupTwoFactor("ch", "123456")).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith("/admin/account/2fa/verify", { challenge: "ch", code: "123456" });
    post.mockResolvedValueOnce({ success: false });
    await expect(result.current.finishSetupTwoFactor("ch", "000000")).rejects.toThrow("Failed to verify code.");
  });
});

describe("AuthProvider – logout", () => {
  it("clears the token and session state", async () => {
    tokenStore.set(adminToken());
    get.mockResolvedValue({ staffId: "s1", email: "x", fullName: "X", role: "Admin", twoFactorEnabled: false, receiveQuoteEmails: false });
    const { result } = await setup();
    expect(result.current.role).toBe("Admin");
    act(() => result.current.logout());
    expect(tokenStore.get()).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.me).toBeNull();
  });
});

it("renders its children", async () => {
  render(
    <AuthProvider>
      <p>child content</p>
    </AuthProvider>,
  );
  expect(await screen.findByText("child content")).toBeInTheDocument();
});
