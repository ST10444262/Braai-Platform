"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLoad } from "@/lib/hooks";
import { fmtDate, roleLabel } from "@/lib/format";
import type { Staff } from "@/lib/types";
import { Avatar, Button, ErrorNote, Pill, Spinner, useToast } from "@/components/ui";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { isAdmin, ready } = useAuth();
  const [deleting, setDeleting] = useState(false);

  async function del() {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleting(true);
    try {
      await api.del(`/admin/account/staff/${id}`);
      toast("User deleted.");
      router.push("/users");
    } catch (err) {
      toast((err as Error).message, "err");
      setDeleting(false);
    }
  }
  const { data: user, loading, error } = useLoad(
    async () => (isAdmin ? ((await api.get<Staff[]>(`/admin/account/staff${qs({ staffAccountId: id })}`))[0] ?? null) : null),
    [id, isAdmin],
  );

  if (ready && !isAdmin) return <ErrorNote message="You don't have access to this page." />;
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!user) return <ErrorNote message="User not found." />;

  const tile = (label: string, value: string) => (
    <div className="rounded-xl bg-card p-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </div>
  );

  return (
    <>
      <div className="mb-4 text-[11px] text-muted">
        <Link href="/users" className="hover:text-ink">
          Admin Users
        </Link>{" "}
        › <span className="text-ink">User Details</span>
      </div>

      <div className="mb-6 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={user.fullName} size={56} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">{user.fullName}</h1>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <div className="mt-2">
              <Pill tone={user.role === "Employee" ? "purple" : "dark"}>{roleLabel(user.role)}</Pill>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/users/${id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="secondary" size="sm" className="w-full">
              <Pencil className="h-3 w-3" /> Edit Employee
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={del} loading={deleting} className="flex-1 sm:flex-none">
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-wide text-muted">Profile Information</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {tile("Account Status", user.isActive ? "Active" : "Inactive")}
          {tile("Account Created", fmtDate(user.createdAt))}
          {tile("Receives Quote Emails", user.receiveQuoteEmails ? "Yes" : "No")}
          {tile("Role", roleLabel(user.role))}
        </div>
      </div>
    </>
  );
}