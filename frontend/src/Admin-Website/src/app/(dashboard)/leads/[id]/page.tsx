"use client";

import { useMemo, useState } from "react";
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                tab === t ? "border-ink bg-ink text-white" : "border-line bg-card hover:bg-stone-200/60",
              )}
            >
              {t !== "All" && <span className={cn("h-1.5 w-1.5 rounded-full", dot[t])} />}
              {t}
              <span className={cn("rounded-full px-1.5 text-[10px]", tab === t ? "bg-white/20" : "bg-white")}>{counts[t] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search leads..."
            className="w-full rounded-full border border-line bg-card py-2 pl-9 pr-4 text-xs outline-none focus:bg-white"
          />
        </div>
      </div>

      {error && <ErrorNote message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full text-left">
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
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted">
                    No leads match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="leads" onChange={setPage} />
        </div>
      )}
    </>
  );
}