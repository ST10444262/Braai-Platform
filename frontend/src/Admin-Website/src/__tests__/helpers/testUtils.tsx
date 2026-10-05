import type { Me, Role } from "@/lib/types";

/** Builds an unsigned JWT-shaped string that decodeToken() can read. */
export function makeToken(payload: Record<string, unknown>) {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64({ alg: "none" })}.${b64(payload)}.sig`;
}

export const futureExp = () => Math.floor(Date.now() / 1000) + 3600;

export function makeMe(over: Partial<Me> = {}): Me {
  return { staffId: "staff-1", email: "me@inflame.co.za", fullName: "Me Myself", role: "Admin", twoFactorEnabled: false, receiveQuoteEmails: false, ...over };
}

/** Value shape returned by the mocked useAuth(). */
export function makeAuth(role: Role | null = "Admin", over: Record<string, unknown> = {}) {
  return {
    me: role ? makeMe({ role }) : null,
    role,
    isAdmin: role === "SuperAdmin" || role === "Admin",
    ready: true,
    login: jest.fn(),
    verifyTwoFactor: jest.fn(),
    setupTwoFactor: jest.fn(),
    finishSetupTwoFactor: jest.fn(),
    logout: jest.fn(),
    reloadMe: jest.fn(),
    ...over,
  };
}

/**
 * Makes a mocked api.get answer by path prefix. Values may be data or a function (path) => data.
 * Unmatched paths reject so missing stubs fail loudly.
 */
export function routeGet(get: jest.Mock, routes: Record<string, unknown>) {
  get.mockImplementation((path: string) => {
    const key = Object.keys(routes)
      .sort((a, b) => b.length - a.length)
      .find((k) => path.startsWith(k));
    if (!key) return Promise.reject(new Error(`Unmocked GET ${path}`));
    const v = routes[key];
    return typeof v === "function" ? Promise.resolve((v as (p: string) => unknown)(path)) : Promise.resolve(v);
  });
}

export const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

export function makeEnquiry(over: Record<string, unknown> = {}) {
  return {
    enquiryId: "e1", enquiryType: "Quote", firstName: "Thandi", lastName: "Nkosi", email: "thandi@example.com", phone: "0821234567",
    productId: null, product: { name: "Big Braai" }, customOptionId: null, message: "Please quote", status: "New",
    createdAt: iso(3_600_000), updatedAt: iso(3_600_000), clientId: null, ...over,
  };
}

export function makeStaff(over: Record<string, unknown> = {}) {
  return { staffId: "s1", identityUserId: "i1", email: "ann@inflame.co.za", fullName: "Ann Smith", role: "Employee", isActive: true, receiveQuoteEmails: true, createdAt: "2026-01-15T10:00:00Z", ...over };
}

export function makeProduct(over: Record<string, unknown> = {}) {
  return {
    productId: "p1", name: "Big Braai", category: "Built-in", productType: "Braai", brand: "Weber", isImported: false, isCustomisable: false,
    price: 12500, onSpecial: null, description: "A big one", isVisible: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z",
    images: [], fuelType: "Gas", braaiType: "Built-in", ...over,
  };
}

export function makeClient(over: Record<string, unknown> = {}) {
  return {
    clientId: "c1abcdef", firstName: "Sipho", lastName: "Dlamini", email: "sipho@example.com", phone: "0831112222", physicalAddress: "1 Main Rd",
    createdAt: "2025-06-10T00:00:00Z", invoiceRecords: [], internalNotes: [], ...over,
  };
}
