import { fmtDate, fmtDateTime, fmtMonthYear, fmtMoney, fullName, requestedProduct, roleLabel, shortClientId, timeAgo } from "@/lib/format";
import type { Enquiry } from "@/lib/types";

describe("fullName", () => {
  it("joins first and last name", () => expect(fullName({ firstName: "Naledi", lastName: "Pillay" })).toBe("Naledi Pillay"));
  it("trims when a part is missing", () => {
    expect(fullName({ firstName: "Naledi" })).toBe("Naledi");
    expect(fullName({ lastName: "Pillay" })).toBe("Pillay");
    expect(fullName({})).toBe("");
  });
});

describe("timeAgo", () => {
  const NOW = new Date("2026-10-04T12:00:00Z").getTime();
  beforeEach(() => jest.spyOn(Date, "now").mockReturnValue(NOW));
  afterEach(() => jest.restoreAllMocks());
  const ago = (ms: number) => new Date(NOW - ms).toISOString();

  it("returns 'Just now' under a minute", () => expect(timeAgo(ago(30_000))).toBe("Just now"));
  it("pluralises minutes", () => {
    expect(timeAgo(ago(60_000))).toBe("1 min ago");
    expect(timeAgo(ago(5 * 60_000))).toBe("5 mins ago");
  });
  it("pluralises hours", () => {
    expect(timeAgo(ago(3_600_000))).toBe("1 hour ago");
    expect(timeAgo(ago(3 * 3_600_000))).toBe("3 hours ago");
  });
  it("says Yesterday for one day", () => expect(timeAgo(ago(24 * 3_600_000))).toBe("Yesterday"));
  it("shows days under a week", () => expect(timeAgo(ago(3 * 24 * 3_600_000))).toBe("3 days ago"));
  it("falls back to a date after a week", () => expect(timeAgo(ago(10 * 24 * 3_600_000))).toMatch(/2026/));
});

describe("fmtMoney", () => {
  it("prefixes R and groups thousands", () => expect(fmtMoney(12500)).toBe("R 12,500"));
  it("keeps at most two decimals", () => expect(fmtMoney(99.456)).toBe("R 99.46"));
  it("handles zero", () => expect(fmtMoney(0)).toBe("R 0"));
});

describe("roleLabel", () => {
  it("maps known roles", () => {
    expect(roleLabel("SuperAdmin")).toBe("Super Admin");
    expect(roleLabel("Admin")).toBe("Admin");
    expect(roleLabel("Employee")).toBe("Employee");
  });
  it("passes unknown through and handles empty", () => {
    expect(roleLabel("Guest")).toBe("Guest");
    expect(roleLabel(null)).toBe("");
    expect(roleLabel(undefined)).toBe("");
  });
});

describe("shortClientId", () => {
  it("uses the first five characters uppercased", () => expect(shortClientId("abcdef-123")).toBe("#CLI-ABCDE"));
});

describe("requestedProduct", () => {
  const base = { enquiryId: "1" } as Enquiry;
  it("prefers the embedded product name", () => expect(requestedProduct({ ...base, product: { name: "Big Braai" }, productId: "p1" }, { p1: "Other" })).toBe("Big Braai"));
  it("falls back to the name map", () => expect(requestedProduct({ ...base, productId: "p1" }, { p1: "Mapped" })).toBe("Mapped"));
  it("labels custom builds", () => expect(requestedProduct({ ...base, customOptionId: "c1" }, {})).toBe("Custom Build"));
  it("defaults to General Enquiry", () => expect(requestedProduct(base, {})).toBe("General Enquiry"));
});

describe("date formatters (en-ZA)", () => {
  const iso = "2026-03-05T14:30:00";
  it("fmtDate gives day, short month and year", () => expect(fmtDate(iso)).toMatch(/05\s+Mar\.?\s+2026/));
  it("fmtMonthYear gives short month and year only", () => {
    expect(fmtMonthYear(iso)).toMatch(/Mar\.?\s+2026/);
    expect(fmtMonthYear(iso)).not.toMatch(/05/);
  });
  it("fmtDateTime includes the day, month and time", () => {
    const out = fmtDateTime(iso);
    expect(out).toMatch(/05/);
    expect(out).toMatch(/Mar/);
    expect(out).toMatch(/14[:.]30/);
  });
});
