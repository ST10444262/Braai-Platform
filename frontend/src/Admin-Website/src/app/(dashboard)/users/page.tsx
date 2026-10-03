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

  if (ready && !isAdmin) return <ErrorNote message="You don't have access to Users." />;

  return (
    <>
      <PageHeader title="Users" subtitle="Manage every employee account with access to the Inflame platform" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Users"
            className="w-full rounded-full border border-line bg-card py-2 pl-9 pr-4 text-xs outline-none focus:bg-white"
          />
        </div>
        <Link href="/users/new">
          <Button>
            <Plus className="h-4 w-4" /> Create User
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold",
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
          <table className="w-full text-left">
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
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-sm text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="users" onChange={setPage} />
        </div>
      )}
    </>
  );
}
//---------------------END OF FILE------------------------------------------------------------------//