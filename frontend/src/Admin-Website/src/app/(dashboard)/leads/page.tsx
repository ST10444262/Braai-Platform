"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Search } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useLoad, useProductNames } from "@/lib/hooks";
import { fullName, requestedProduct, timeAgo } from "@/lib/format";
import type { Enquiry } from "@/lib/types";
import { ErrorNote, PageHeader, Pagination, Spinner, StatusBadge, cn } from "@/components/ui";

const TABS = ["All", "New", "Contacted", "Converted", "Dead"] as const;
const PAGE_SIZE = 8;

export default function LeadsPage() {
  const router = useRouter();
  const names = useProductNames();
  const { data, loading, error } = useLoad(() => api.get<Enquiry[]>(`/admin/enquiries${qs({ pageNumber: 1, pageSize: 1000 })}`));
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const all = useMemo(() => data ?? [], [data]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: all.length };
    all.forEach((e) => (c[e.status] = (c[e.status] ?? 0) + 1));
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return all.filter((e) => {
      if (tab !== "All" && e.status !== tab) return false;
      if (!s) return true;
      return [fullName(e), e.email, e.phone, requestedProduct(e, names)].some((v) => v.toLowerCase().includes(s));
    });
  }, [all, tab, search, names]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dot: Record<string, string> = { New: "bg-orange-500", Contacted: "bg-stone-800", Converted: "bg-violet-500", Dead: "bg-stone-400" };

  return (
    <>
      <PageHeader
        title="Lead Management"
        subtitle="View, filter, and manage every quote request submitted through the platform — from first contact to conversion."
      />

      <div className="mb-4 space-y-3 md:flex md:items-center md:justify-between md:gap-3 md:space-y-0">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition md:py-1.5",
                tab === t ? "border-ink bg-ink text-white" : "border-line bg-card hover:bg-stone-200/60",
              )}
            >
              {t !== "All" && <span className={cn("h-1.5 w-1.5 rounded-full", dot[t])} />}
              {t}
              <span className={cn("rounded-full px-1.5 text-[10px]", tab === t ? "bg-white/20" : "bg-white")}>{counts[t] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search leads..."
            className="w-full rounded-full border border-line bg-card py-2.5 pl-9 pr-4 text-base outline-none focus:bg-white md:py-2 md:text-xs"
          />
        </div>
      </div>

      {error && <ErrorNote message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          {/* Desktop table */}
          <table className="hidden w-full text-left md:table">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                {["Customer", "Requested Product", "Contact", "Received", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr
                  key={e.enquiryId}
                  onClick={() => router.push(`/leads/${e.enquiryId}`)}
                  className="cursor-pointer border-t border-line text-xs hover:bg-white/70"
                >
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-semibold">{fullName(e)}</div>
                    <div className="text-[11px] text-muted">{e.email}</div>
                  </td>
                  <td className="px-5 py-4 font-medium">{requestedProduct(e, names)}</td>
                  <td className="px-5 py-4 text-muted">{e.phone}</td>
                  <td className="px-5 py-4 text-muted">{timeAgo(e.createdAt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-5 py-4 text-muted">
                    <EllipsisVertical className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="space-y-2 p-3 md:hidden">
            {rows.map((e) => (
              <li key={e.enquiryId}>
                <Link href={`/leads/${e.enquiryId}`} className="block rounded-xl border border-line bg-white p-4 active:bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{fullName(e)}</div>
                      <div className="truncate text-xs text-muted">{e.email}</div>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="mt-2 text-xs font-medium">{requestedProduct(e, names)}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                    <span>{e.phone}</span>
                    <span>{timeAgo(e.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {rows.length === 0 && <div className="py-12 text-center text-sm text-muted">No leads match your filters.</div>}
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="leads" onChange={setPage} />
        </div>
      )}
    </>
  );
}