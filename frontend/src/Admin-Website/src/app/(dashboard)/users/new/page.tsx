"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, Chips, ErrorNote, Field, TextInput, useToast } from "@/components/ui";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(14);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("") + "aA1!";
}

export default function CreateUserPage() {
  const router = useRouter();
  const toast = useToast();
  const { role, isAdmin, ready } = useAuth();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", role: "Employee", password: "" });
  const [busy, setBusy] = useState(false);

  if (ready && !isAdmin) return <ErrorNote message="You don't have access to this page." />;

  const roleOptions = role === "SuperAdmin" ? ["Employee", "Admin"] : ["Employee"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.password) {
      toast("Fill in every required field.", "err");
      return;
    }
    setBusy(true);
    try {
      await api.post("/admin/account/staff", {
        email: f.email.trim(),
        password: f.password,
        fullName: `${f.firstName.trim()} ${f.lastName.trim()}`,
        role: f.role,
      });
      toast(`Account created. Share the temporary password with ${f.firstName.trim()}.`);
      router.push("/users");
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
          Admin Users
        </Link>{" "}
        › <span className="text-ink">Create User</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Create User</h1>
      <p className="mb-8 mt-2 text-sm text-muted">Manage every employee and admin account with access to the Inflame platform</p>

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
            <Field label="Role">
              <Chips options={roleOptions} value={f.role} onChange={(v) => setF({ ...f, role: v })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Temporary Password *" hint="Share this with the new user securely. They can change it from My Profile after signing in.">
                <div className="flex gap-2">
                  <TextInput value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                  <Button type="button" variant="secondary" onClick={() => setF({ ...f, password: generatePassword() })}>
                    Generate
                  </Button>
                </div>
              </Field>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Link href="/users">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={busy}>
            + Create Employee
          </Button>
        </div>
      </form>
    </>
  );
}