"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLoad } from "@/lib/hooks";
import { Button, Chips, ErrorNote, Field, TextInput, useToast, Spinner } from "@/components/ui";
import type { Staff } from "@/lib/types";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { role, isAdmin, ready } = useAuth();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", role: "Employee", password: "", isActive: true });
  const [busy, setBusy] = useState(false);

  const { data: user, loading, error } = useLoad(
    async () => (isAdmin ? ((await api.get<Staff[]>(`/admin/account/staff${qs({ staffAccountId: id })}`))[0] ?? null) : null),
    [id, isAdmin],
  );

  useEffect(() => {
    if (user) {
      // Split the fullName into first and last name
      const parts = user.fullName.split(" ");
      setF({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        email: user.email,
        role: user.role,
        password: "",
        isActive: user.isActive,
      });
    }
  }, [user]);

  if (ready && !isAdmin) return <ErrorNote message="You don't have access to this page." />;
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!user) return <ErrorNote message="User not found." />;

  const roleOptions = role === "SuperAdmin" ? ["Employee", "Admin"] : ["Employee"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim()) {
      toast("Fill in every required field.", "err");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("email", f.email.trim());
      form.append("fullName", `${f.firstName.trim()} ${f.lastName.trim()}`);
      form.append("role", f.role);
      form.append("isActive", f.isActive.toString());
      if (f.password) {
        form.append("newPassword", f.password);
      }

      await api.form(`/admin/account/staff/${id}`, form, "PUT");
      toast(`Account for ${f.firstName.trim()} updated.`);
      router.push(`/users/${id}`);
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-3 text-[11px] text-muted">
        <Link href="/users" className="hover:text-ink">
          Users
        </Link>{" "}
        ›{" "}
        <Link href={`/users/${id}`} className="hover:text-ink">
          User Details
        </Link>{" "}
        › <span className="text-ink">Edit User</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Edit User</h1>
      <p className="mb-8 mt-2 text-sm text-muted">Update employee and admin account details.</p>

      <form onSubmit={submit} className="max-w-3xl">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-5 text-[10px] font-semibold uppercase tracking-wide text-muted">Profile</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name *">
              <TextInput placeholder="e.g. Naledi" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
            </Field>
            <Field label="Last Name *">
              <TextInput placeholder="e.g. Pillay" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
            </Field>
            <Field label="Work Email *">
              <TextInput type="email" placeholder="name@inflame.co.za" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Field>
            <Field label="New Password (optional)" hint="Leave blank to keep the current password.">
              <div className="flex gap-2">
                <TextInput value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                <Button type="button" variant="secondary" onClick={() => {
                  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
                  const arr = new Uint32Array(14);
                  crypto.getRandomValues(arr);
                  const newPass = Array.from(arr, (n) => chars[n % chars.length]).join("") + "aA1!";
                  setF({ ...f, password: newPass });
                }}>
                  Generate
                </Button>
              </div>
            </Field>
            <Field label="Role">
              <Chips options={roleOptions} value={f.role} onChange={(v) => setF({ ...f, role: v })} />
            </Field>
            <Field label="Status">
              <div className="flex gap-4 items-center h-10">
                 <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" checked={f.isActive} onChange={() => setF({...f, isActive: true})} /> Active
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" checked={!f.isActive} onChange={() => setF({...f, isActive: false})} /> Inactive
                 </label>
              </div>
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Link href={`/users/${id}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={busy}>
             Save Changes
          </Button>
        </div>
      </form>
    </>
  );
}
