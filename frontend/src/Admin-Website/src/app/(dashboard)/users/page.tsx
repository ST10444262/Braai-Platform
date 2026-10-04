"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Plus, Search } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLoad } from "@/lib/hooks";
import { roleLabel } from "@/lib/format";
import type { Staff } from "@/lib/types";
import { Avatar, Button, ErrorNote, PageHeader, Pagination, Pill, Spinner, cn } from "@/components/ui";

const PAGE_SIZE = 8;
const TABS = ["All Users", "Employee", "Admin"] as const;

export default function UsersPage() {
  const router = useRouter();
  const { isAdmin, ready } = useAuth();
  const { data, loading, error } = useLoad(
    () => (isAdmin ? api.get<Staff[]>(`/admin/account/staff${qs({ pageNumber: 1, pageSize: 1000 })}`) : Promise.resolve([] as Staff[])),
    [isAdmin],
  );
  const [tab, setTab] = useState<(typeof TABS)[number]>("All Users");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const all = useMemo(() => data ?? [], [data]);
  const counts = useMemo(
    () => ({
      "All Users": all.length,
      Employee: all.filter((s) => s.role === "Employee").length,
      Admin: all.filter((s) => s.role === "Admin").length,
    }),
    [all],
  );
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return all.filter(
      (u) => (tab === "All Users" || u.role === tab) && (!s || u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)),
    );
  }, [all, tab, search]);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (ready && !isAdmin) return <ErrorNote message="You don't have access to Admin Users." />;

  return (
    <>
      <PageHeader title="Admin Users" subtitle="Manage every employee account with access to the Inflame platform" />

      <div className="mb-4 space-y-3 md:flex md:flex-wrap md:items-center md:justify-between md:gap-3 md:space-y-0">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Users"
            className="w-full rounded-full border border-line bg-card py-2.5 pl-9 pr-4 text-base outline-none focus:bg-white md:py-2 md:text-xs"
          />
        </div>
        <Link href="/users/new" className="block">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4" /> Create Employee
          </Button>
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold md:py-1.5",
              tab === t ? "border-ink bg-ink text-white" : "border-line bg-card",
            )}
          >
            {t}
            {t === "All Users" && <span className="rounded-full bg-white/20 px-1.5 text-[10px]">{counts[t]}</span>}
          </button>
        ))}
      </div>

      {error && <ErrorNote message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-3xl overflow-hidden rounded-2xl border border-line bg-card">
          {/* Desktop table */}
          <table className="hidden w-full text-left md:table">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.staffId} onClick={() => router.push(`/users/${u.staffId}`)} className="cursor-pointer border-t border-line hover:bg-white/70">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} />
                      <div>
                        <div className="text-[13px] font-semibold">{u.fullName}</div>
                        <div className="text-[11px] text-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Pill tone={u.role === "Employee" ? "grey" : "purple"}>{roleLabel(u.role)}</Pill>
                  </td>
                  <td className="px-5 py-3 text-right text-muted">
                    <EllipsisVertical className="ml-auto h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="space-y-2 p-3 md:hidden">
            {rows.map((u) => (
              <li key={u.staffId}>
                <Link href={`/users/${u.staffId}`} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5 active:bg-card">
                  <Avatar name={u.fullName} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{u.fullName}</div>
                    <div className="truncate text-xs text-muted">{u.email}</div>
                  </div>
                  <Pill tone={u.role === "Employee" ? "grey" : "purple"}>{roleLabel(u.role)}</Pill>
                </Link>
              </li>
            ))}
          </ul>

          {rows.length === 0 && <div className="py-12 text-center text-sm text-muted">No users found.</div>}
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="users" onChange={setPage} />
        </div>
      )}
    </>
  );
}