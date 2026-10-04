import { ApiError, api, decodeToken, qs, tokenStore } from "@/lib/api";

function makeToken(payload: object) {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64({ alg: "none" })}.${b64(payload)}.sig`;
}

function mockFetch(status: number, body: unknown, raw = false) {
  const text = body === null ? "" : raw ? (body as string) : JSON.stringify(body);
  const fn = jest.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, text: () => Promise.resolve(text) });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe("tokenStore", () => {
  it("sets, gets and clears the token", () => {
    expect(tokenStore.get()).toBeNull();
    tokenStore.set("abc");
    expect(tokenStore.get()).toBe("abc");
    tokenStore.clear();
    expect(tokenStore.get()).toBeNull();
  });
});

describe("decodeToken", () => {
  it("reads a plain role claim", () => {
    const d = decodeToken(makeToken({ role: "Admin", sub: "u1", email: "a@b.co", exp: 123 }));
    expect(d).toEqual({ role: "Admin", userId: "u1", email: "a@b.co", exp: 123 });
  });
  it("reads the Microsoft role claim", () => {
    const d = decodeToken(makeToken({ "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Employee", nameid: "u2" }));
    expect(d?.role).toBe("Employee");
    expect(d?.userId).toBe("u2");
  });
  it("picks the highest-ranked role from an array", () => {
    expect(decodeToken(makeToken({ role: ["Employee", "SuperAdmin"] }))?.role).toBe("SuperAdmin");
  });
  it("returns null for unknown roles, missing roles and garbage", () => {
    expect(decodeToken(makeToken({ role: "Guest" }))).toBeNull();
    expect(decodeToken(makeToken({}))).toBeNull();
    expect(decodeToken("not-a-token")).toBeNull();
  });
});

describe("qs", () => {
  it("builds a query string", () => expect(qs({ a: 1, b: "x y" })).toBe("?a=1&b=x+y"));
  it("skips undefined, null and empty values", () => expect(qs({ a: undefined, b: null, c: "", d: 0 })).toBe("?d=0"));
  it("returns empty string when nothing is set", () => expect(qs({})).toBe(""));
});

describe("api request", () => {
  it("sends a GET to /api and returns parsed JSON", async () => {
    const f = mockFetch(200, { hello: "world" });
    await expect(api.get("/admin/overview")).resolves.toEqual({ hello: "world" });
    expect(f.mock.calls[0][0]).toBe("/api/admin/overview");
  });

  it("attaches the bearer token when present", async () => {
    tokenStore.set("tok");
    const f = mockFetch(200, {});
    await api.get("/x");
    expect((f.mock.calls[0][1].headers as Headers).get("Authorization")).toBe("Bearer tok");
  });

  it("JSON-encodes POST bodies and sets the content type", async () => {
    const f = mockFetch(200, {});
    await api.post("/x", { a: 1 });
    const init = f.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"a":1}');
    expect((init.headers as Headers).get("Content-Type")).toBe("application/json");
  });

  it("sends no body for POST without payload, and uses PUT/DELETE verbs", async () => {
    const f = mockFetch(200, {});
    await api.post("/x");
    expect(f.mock.calls[0][1].body).toBeUndefined();
    await api.put("/x", { a: 1 });
    expect(f.mock.calls[1][1].method).toBe("PUT");
    await api.del("/x");
    expect(f.mock.calls[2][1].method).toBe("DELETE");
  });

  it("passes FormData through without a JSON content type", async () => {
    const f = mockFetch(200, {});
    const fd = new FormData();
    await api.form("/x", fd, "PUT");
    const init = f.mock.calls[0][1];
    expect(init.method).toBe("PUT");
    expect(init.body).toBe(fd);
    expect((init.headers as Headers).has("Content-Type")).toBe(false);
  });

  it("returns null for an empty body and raw text for non-JSON", async () => {
    mockFetch(204, null);
    await expect(api.get("/x")).resolves.toBeNull();
    mockFetch(200, "plain", true);
    await expect(api.get("/x")).resolves.toBe("plain");
  });

  it("throws ApiError(0) when the network is down", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("boom")) as unknown as typeof fetch;
    await expect(api.get("/x")).rejects.toMatchObject({ status: 0, message: "Cannot reach the server. Is the API running?" });
  });

  describe("error messages", () => {
    const cases: [string, number, unknown, string][] = [
      ["string body", 400, "Bad thing", "Bad thing"],
      ["message field", 400, { message: "Msg" }, "Msg"],
      ["error field", 400, { error: "Err" }, "Err"],
      ["validation errors", 400, { errors: { Email: ["Email is invalid"] } }, "Email is invalid"],
      ["title field", 400, { title: "Title" }, "Title"],
      ["403 default", 403, {}, "You don't have permission to do that."],
      ["429 default", 429, {}, "Too many requests. Please wait a moment."],
      ["generic default", 500, {}, "Request failed (500)"],
    ];
    it.each(cases)("%s", async (_n, status, body, expected) => {
      mockFetch(status, body, typeof body === "string");
      const err = (await api.get("/x").catch((e) => e)) as ApiError;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe(expected);
      expect(err.status).toBe(status);
    });
  });

  it("treats success:false on a 200 as an error", async () => {
    mockFetch(200, { success: false, message: "Nope" });
    await expect(api.get("/x")).rejects.toMatchObject({ message: "Nope", status: 200 });
  });

describe("401 handling", () => {
  // jsdom does not allow redefining window.location, but it reports
  // attempted navigation through console.error
  // ("Not implemented: navigation"), so we use that.
  let errSpy: jest.SpyInstance;

  const navigated = () =>
    errSpy.mock.calls.some((c) =>
      String(c[0]?.message ?? c[0]).includes("navigation")
    );

  beforeEach(() => {
    // Every test must start with a clean authentication state.
    tokenStore.clear();

    errSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    // Prevent authentication state leaking into the next test.
    tokenStore.clear();

    errSpy.mockRestore();
  });

  it("clears the token and redirects to /login", async () => {
    tokenStore.set("tok");

    mockFetch(401, {
      message: "Expired",
    });

    await expect(
      api.get("/admin/overview")
    ).rejects.toThrow("Expired");

    expect(tokenStore.get()).toBeNull();
    expect(navigated()).toBe(true);
  });

  it("does not redirect for a failed login attempt", async () => {
    tokenStore.set("tok");

    mockFetch(401, {
      message: "Bad credentials",
    });

    await expect(
      api.post("/admin/account/login", {})
    ).rejects.toThrow("Bad credentials");

    // Login failures must not clear an existing token
    // through the generic 401 handler.
    expect(tokenStore.get()).toBe("tok");

    expect(navigated()).toBe(false);
  });

  it("does not redirect when there was no token to begin with", async () => {
    // Explicitly verify the condition this test is testing.
    expect(tokenStore.get()).toBeNull();

    mockFetch(401, {
      message: "Unauthorised",
    });

    await expect(
      api.get("/x")
    ).rejects.toThrow("Unauthorised");

    expect(tokenStore.get()).toBeNull();
    expect(navigated()).toBe(false);
  });
});
});
