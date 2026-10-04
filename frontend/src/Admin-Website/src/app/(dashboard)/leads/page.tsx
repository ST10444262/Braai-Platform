"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, EllipsisVertical } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { timeAgo, requestedProduct } from "@/lib/format";
import type { Enquiry } from "@/lib/types";
import {
  ErrorNote,
  PageHeader,
  Pagination,
  Spinner,
  StatusBadge,
  cn,
} from "@/components/ui";

const PAGE_SIZE = 6;

const TABS = [
  "All Leads",
  "New",
  "Under Review",
  "Contacted",
  "Converted",
  "Dead",
] as const;

export default function LeadsPage() {
  const router = useRouter();

  const { data, loading, error } = useLoad(
    () =>
      api.get<Enquiry[]>(
        `/admin/enquiries${qs({
          pageNumber: 1,
          pageSize: 1000,
        })}`,
      ),
    [],
  );

  const [tab, setTab] =
    useState<(typeof TABS)[number]>("All Leads");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const all = useMemo(() => data ?? [], [data]);

  const counts = useMemo(
    () => ({
      "All Leads": all.length,

      New: all.filter((l) => l.status === "New").length,

      "Under Review": all.filter(
        (l) => l.status === "Under Review",
      ).length,

      Contacted: all.filter(
        (l) => l.status === "Contacted",
      ).length,

      Converted: all.filter(
        (l) => l.status === "Converted",
      ).length,

      Dead: all.filter(
        (l) => l.status === "Dead",
      ).length,
    }),
    [all],
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return all.filter((l) => {
      if (
        tab !== "All Leads" &&
        l.status !== tab
      ) {
        return false;
      }

      if (!s) return true;

      const term =
        `${l.firstName} ${l.lastName} ${l.email} ${l.phone}`.toLowerCase();

      return term.includes(s);
    });
  }, [all, tab, search]);

  const rows = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function dotColor(status: string) {
    if (status === "New") return "bg-orange-500";

    if (status === "Under Review")
      return "bg-amber-500";

    if (status === "Converted")
      return "bg-purple-500";

    return "bg-stone-400";
  }

  return (
    <>
      <PageHeader
        title="Lead Management"
        subtitle="View, filter, and manage every quote request submitted through the platform — from first contact to conversion."
      />

      {/* Tabs + Search */}
      <div className="mb-4 space-y-3 md:flex md:items-center md:justify-between md:gap-3 md:space-y-0">

        {/* Tabs */}
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
                tab === t
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-card hover:bg-white",
              )}
            >
              {t !== "All Leads" && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    dotColor(t),
                  )}
                />
              )}

              {t}

              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px]",
                  tab === t
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-muted",
                )}
              >
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
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
        <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-line bg-card">

     
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">

              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-wider text-muted">

                  <th className="px-5 py-4 font-medium">
                    Customer
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Requested Product
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Contact
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Received
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>
                {rows.map((l) => (
                  <tr
                    key={l.enquiryId}
                    onClick={() =>
                      router.push(
                        `/leads/${l.enquiryId}`,
                      )
                    }
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-white/70"
                  >

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-semibold">
                        {l.firstName} {l.lastName}
                      </div>

                      <div className="text-[11px] text-muted">
                        {l.email}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4 text-[13px] font-medium">
                      {requestedProduct(l, {})}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 text-[13px] text-muted">
                      {l.phone || "-"}
                    </td>

                    {/* Received */}
                    <td className="px-5 py-4 text-[13px] text-muted">
                      {timeAgo(l.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={l.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right text-muted">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="rounded p-1 hover:bg-stone-100"
                      >
                        <EllipsisVertical className="ml-auto h-4 w-4" />
                      </button>
                    </td>

                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted"
                    >
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            noun="leads"
            onChange={setPage}
          />
        </div>
      )}
    </>
  );
}

//---------------------END OF FILE------------------------------------------------------------------//