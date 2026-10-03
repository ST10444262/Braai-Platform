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
import { Avatar, Button, ErrorNote, Pill, Spinner, Modal, Field, TextInput, Chips, useToast } from "@/components/ui";

//------------------------------------------------------------------------------------------//
export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { me, role, isAdmin, ready } = useAuth();
  const { data: user, loading, error, reload } = useLoad(
    async () => (isAdmin ? ((await api.get<Staff[]>(`/admin/account/staff${qs({ staffAccountId: id })}`))[0] ?? null) : null),
    [id, isAdmin],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [f, setF] = useState({ fullName: "", email: "", role: "Employee", isActive: true });
  const [busy, setBusy] = useState(false);

  if (ready && !isAdmin) return <ErrorNote message="You don't have access to this page." />;
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!user) return <ErrorNote message="User not found." />;

  const canEdit = role === "SuperAdmin" || (role === "Admin" && user.role === "Employee");
  const canDelete = canEdit && me?.staffId !== user.staffId && user.role !== "SuperAdmin";

  const tile = (label: string, value: string) => (
    <div className="rounded-xl bg-card p-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );

  const roleOptions = role === "SuperAdmin" ? ["Employee", "Admin"] : ["Employee"];
  
  const activeOptions = ["Active", "Inactive"];

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.fullName.trim() || !f.email.trim()) {
      toast("Fill in every required field.", "err");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("email", f.email.trim());
      form.append("fullName", f.fullName.trim());
      form.append("role", f.role);
      form.append("isActive", String(f.isActive));

      await api.form(`/admin/account/staff/${id}`, form, "PUT");
      toast("User updated successfully.");
      setEditOpen(false);
      await reload();
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete ${user?.fullName}?`)) return;
    try {
      await api.del(`/admin/account/staff/${id}`);
      toast("User deleted.");
      router.push("/users");
    } catch (err) {
      toast((err as Error).message, "err");
    }
  }

  return (
    <>
      <div className="mb-4 text-[11px] text-muted">
        <Link href="/users" className="hover:text-ink">
          Users
        </Link>{" "}
        › <span className="text-ink">User Details</span>
      </div>

      <div className="mb-6 flex max-w-2xl items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} size={56} />
          <div>
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
            <p className="text-xs text-muted">{user.email}</p>
            <div className="mt-2">
              <Pill tone={user.role === "Employee" ? "purple" : "dark"}>{roleLabel(user.role)}</Pill>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setF({ fullName: user.fullName, email: user.email, role: user.role, isActive: user.isActive });
                setEditOpen(true);
              }}
            >
              <Pencil className="h-3 w-3" /> Edit User
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl border border-line bg-white p-6 shadow-sm">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-wide text-muted">Profile Information</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {tile("Account Status", user.isActive ? "Active" : "Inactive")}
          {tile("Account Created", fmtDate(user.createdAt))}
          {tile("Receives Quote Emails", user.receiveQuoteEmails ? "Yes" : "No")}
          {tile("Role", roleLabel(user.role))}
        </div>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button loading={busy} onClick={handleEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full Name *">
            <TextInput value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} />
          </Field>
          <Field label="Work Email *">
            <TextInput type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <Field label="Role">
            <Chips options={roleOptions} value={f.role} onChange={(v) => setF({ ...f, role: v })} />
          </Field>
          <Field label="Status">
            <Chips options={activeOptions} value={f.isActive ? "Active" : "Inactive"} onChange={(v) => setF({ ...f, isActive: v === "Active" })} />
          </Field>
        </div>
      </Modal>
    </>
  );
}
//---------------------END OF FILE------------------------------------------------------------------//