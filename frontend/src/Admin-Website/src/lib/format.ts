import type { Enquiry, Role } from "./types";

export const fullName = (p: { firstName?: string; lastName?: string }) =>
  `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

export const fmtMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { month: "short", year: "numeric" });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return fmtDate(iso);
}

export const fmtMoney = (n: number) => `R ${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export const roleLabel = (r?: Role | string | null) =>
  r === "SuperAdmin" ? "Super Admin" : r === "Admin" ? "Admin" : r === "Employee" ? "Employee" : r ?? "";

export const shortClientId = (id: string) => `#CLI-${id.slice(0, 5).toUpperCase()}`;

export function requestedProduct(e: Enquiry, names: Record<string, string>): string {
  if (e.product?.name) return e.product.name;
  if (e.productId && names[e.productId]) return names[e.productId];
  if (e.customOptionId) return "Custom Build";
  return "General Enquiry";
}