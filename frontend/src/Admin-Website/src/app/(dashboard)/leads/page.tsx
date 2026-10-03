"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, EllipsisVertical } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { timeAgo, requestedProduct } from "@/lib/format";
import type { Enquiry } from "@/lib/types";
import { ErrorNote, PageHeader, Pagination, Spinner, StatusBadge, cn } from "@/components/ui";

const PAGE_SIZE = 6;
const TABS = ["All Leads", "New", "UnderReview", "Contacted", "Converted", "Dead"] as const;

export default function LeadsPage() {
  const router = useRouter();
  const { data, loading, error } = useLoad(
    () => api.get<Enquiry[]>(`/admin/enquiries${qs({ pageNumber: 1, pageSize: 1000 })}`),
    [],
  );

  const [tab, setTab] = useState<(typeof TABS)[number]>("All Leads");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const all = useMemo(() => data ?? [], [data]);
  
  const counts = useMemo(() => ({
    "All Leads": all.length,
    New: all.filter((l) => l.status === "New").length,
    UnderReview: all.filter((l) => l.status === "UnderReview").length,
    Contacted: all.filter((l) => l.status === "Contacted").length,
    Converted: all.filter((l) => l.status === "Converted").length,
    Dead: all.filter((l) => l.status === "Dead").length,
  }), [all]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return all.filter((l) => {
      if (tab !== "All Leads" && l.status !== tab) return false;
      if (!s) return true;
      const term = `${l.firstName} ${l.lastName} ${l.email} ${l.phone}`.toLowerCase();
      return term.includes(s);
    });
  }, [all, tab, search]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function dotColor(status: string) {
    if (status === "New") return "bg-orange-500";
    if (status === "UnderReview") return "bg-amber-500";
    if (status === "Converted") return "bg-purple-500";
    return "bg-stone-400";
  }

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
                "flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold transition",
                tab === t ? "border-ink bg-ink text-white" : "border-line bg-card hover:bg-white",
              )}
            >
              {t !== "All Leads" && (
                <span className={cn("h-1.5 w-1.5 rounded-full", dotColor(t))} />
              )}
              {t === "UnderReview" ? "Under Review" : t}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[9px]", tab === t ? "bg-white/20 text-white" : "bg-stone-100 text-muted")}>
                {counts[t]}
              </span>
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
              <tr className="text-[10px] uppercase tracking-wider text-muted border-b border-line">
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Requested Product</th>
                <th className="px-5 py-4 font-medium">Contact</th>
                <th className="px-5 py-4 font-medium">Received</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.enquiryId} onClick={() => router.push(`/leads/${l.enquiryId}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-white/70">
                  <td className="px-5 py-4">
                    <div className="text-[13px] font-semibold">{l.firstName} {l.lastName}</div>
                    <div className="text-[11px] text-muted">{l.email}</div>
                  </td>
                  <td className="px-5 py-4 text-[13px] font-medium">
                    {requestedProduct(l, {})}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-muted">
                    {l.phone || "-"}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-muted">
                    {timeAgo(l.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-5 py-4 text-right text-muted">
                    <button className="rounded hover:bg-stone-100 p-1">
                      <EllipsisVertical className="ml-auto h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted">
                    No leads found.
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
//---------------------END OF FILE------------------------------------------------------------------//
