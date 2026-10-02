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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search clients..."
              className="w-full rounded-full border border-line bg-card py-2 pl-9 pr-4 text-xs outline-none focus:bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="h-full appearance-none rounded-full border border-line bg-card py-2 pl-4 pr-9 text-xs outline-none"
            >
              <option value="all">Filter by...</option>
              <option value="with">Has invoices</option>
              <option value="none">No invoices</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Create Client
        </Button>
      </div>

      {error && <ErrorNote message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full text-left">
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
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="clients" onChange={setPage} />
        </div>
      )}

      <ClientDrawer clientId={openId} onClose={() => setOpenId(null)} onChanged={refresh} />
      <CreateClientDrawer open={creating} onClose={() => setCreating(false)} onCreated={refresh} />
    </>
  );
}