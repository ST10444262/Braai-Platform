"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useLoad } from "@/lib/hooks";
import { fullName } from "@/lib/format";
import type { Client } from "@/lib/types";
import { Button, ErrorNote, PageHeader, Pagination, Spinner } from "@/components/ui";
import { ClientDrawer, CreateClientDrawer } from "@/components/ClientDrawer";

const PAGE_SIZE = 8;

export default function ClientsPage() {
  const { data, loading, error, reload } = useLoad(() => api.get<Client[]>(`/admin/crm/clients${qs({ pageNumber: 1, pageSize: 1000 })}`));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [invoiceCounts, setInvoiceCounts] = useState<Record<string, number>>({});

  const all = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return all.filter((c) => {
      const hay = `${fullName(c)} ${c.email} ${c.phone}`.toLowerCase();
      if (s && !hay.includes(s)) return false;
      if (filter === "with" && !(invoiceCounts[c.clientId] > 0)) return false;
      if (filter === "none" && invoiceCounts[c.clientId] > 0) return false;
      return true;
    });
  }, [all, search, filter, invoiceCounts]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // The list endpoint doesn't include invoices, so fetch them for the visible rows only
  useEffect(() => {
    let alive = true;
    rows.forEach(async (c) => {
      if (invoiceCounts[c.clientId] !== undefined) return;
      try {
        const detail = (await api.get<Client[]>(`/admin/crm/clients${qs({ clientId: c.clientId })}`))[0];
        if (alive && detail) setInvoiceCounts((m) => ({ ...m, [c.clientId]: detail.invoiceRecords?.length ?? 0 }));
      } catch {
        /* leave blank */
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.map((r) => r.clientId).join(",")]);

  function refresh() {
    setInvoiceCounts({});
    reload();
  }

  return (
    <>
      <PageHeader title="Client Directory" subtitle="Manage and view all registered clients across the platform." />

      <div className="mb-4 space-y-3 md:flex md:flex-wrap md:items-center md:justify-between md:gap-3 md:space-y-0">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search clients..."
            className="w-full rounded-full border border-line bg-card py-2.5 pl-9 pr-4 text-base outline-none focus:bg-white md:py-2 md:text-xs"
          />
        </div>
        <div className="flex gap-3 md:contents">
          <div className="relative flex-1 md:order-first md:ml-3 md:flex-none">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="h-full w-full appearance-none rounded-full border border-line bg-card py-2.5 pl-4 pr-9 text-base outline-none md:py-2 md:text-xs"
            >
              <option value="all">Filter by...</option>
              <option value="with">Has invoices</option>
              <option value="none">No invoices</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
          <Button onClick={() => setCreating(true)} className="shrink-0 md:ml-auto">
            <Plus className="h-4 w-4" /> Create Client
          </Button>
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
                {["Client Name", "Email Address", "Phone Number", "Total Uploaded Invoices", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.clientId} className="border-t border-line text-xs">
                  <td className="px-5 py-4 text-[13px] font-semibold">{fullName(c)}</td>
                  <td className="px-5 py-4 text-muted">{c.email}</td>
                  <td className="px-5 py-4 text-muted">{c.phone}</td>
                  <td className="px-5 py-4">{invoiceCounts[c.clientId] ?? "…"}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setOpenId(c.clientId)}
                      className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium hover:bg-stone-100"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="space-y-2 p-3 md:hidden">
            {rows.map((c) => (
              <li key={c.clientId} className="rounded-xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{fullName(c)}</div>
                    <div className="truncate text-xs text-muted">{c.email}</div>
                    <div className="text-xs text-muted">{c.phone}</div>
                  </div>
                  <button
                    onClick={() => setOpenId(c.clientId)}
                    className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-xs font-medium active:bg-stone-100"
                  >
                    Manage
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-muted">{invoiceCounts[c.clientId] ?? "…"} uploaded invoices</div>
              </li>
            ))}
          </ul>

          {rows.length === 0 && <div className="py-12 text-center text-sm text-muted">No clients found.</div>}
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="clients" onChange={setPage} />
        </div>
      )}

      <ClientDrawer clientId={openId} onClose={() => setOpenId(null)} onChanged={refresh} />
      <CreateClientDrawer open={creating} onClose={() => setCreating(false)} onCreated={refresh} />
    </>
  );
}