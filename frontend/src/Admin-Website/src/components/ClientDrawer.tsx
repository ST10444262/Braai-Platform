"use client";

import { useEffect, useState } from "react";
import { Download, FileText, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLoad, useStaffDirectory } from "@/lib/hooks";
import { fmtDate, fmtDateTime, fmtMonthYear, fullName, roleLabel, shortClientId } from "@/lib/format";
import type { Client } from "@/lib/types";
import { Avatar, Button, ConfirmDialog, Drawer, Dropzone, Field, TextInput, inputCls, useToast } from "./ui";

const emptyForm = { fullName: "", email: "", phone: "", physicalAddress: "" };

export function ClientDrawer({
  clientId,
  onClose,
  onChanged,
}: {
  clientId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { me, isAdmin } = useAuth();
  const toast = useToast();
  const staff = useStaffDirectory();
  const { data: client, loading, reload } = useLoad(
    async () => (clientId ? ((await api.get<Client[]>(`/admin/crm/clients${qs({ clientId })}`))[0] ?? null) : null),
    [clientId],
  );
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({ fullName: fullName(client), email: client.email, phone: client.phone, physicalAddress: client.physicalAddress });
      setEditing(false);
    }
  }, [client]);

  async function run(fn: () => Promise<void>, ok?: string) {
    setBusy(true);
    try {
      await fn();
      if (ok) toast(ok);
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  const saveDetails = () =>
    run(async () => {
      if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) throw new Error("Name, email and phone are required.");
      await api.put(`/admin/crm/clients/${clientId}`, { clientId, ...form });
      reload();
      onChanged();
    }, "Client updated.");

  const addNote = () =>
    run(async () => {
      if (!me?.staffId) throw new Error("Your staff profile could not be loaded (is GET /me deployed?).");
      if (!note.trim()) throw new Error("Write a note first.");
      await api.post(`/admin/crm/clients/${clientId}/notes`, { content: note.trim(), staffAccountId: me.staffId });
      setNote("");
      reload();
    }, "Note added.");

  const deleteNote = (noteId: string) =>
    run(async () => {
      await api.del(`/admin/crm/clients/${clientId}/notes/${noteId}`);
      reload();
    });

  const uploadInvoices = (files: File[]) =>
    run(async () => {
      if (!me?.staffId) throw new Error("Your staff profile could not be loaded (is GET /me deployed?).");
      const fd = new FormData();
      files.forEach((f) => fd.append("Files", f));
      fd.append("StaffAccountId", me.staffId);
      await api.form(`/admin/crm/clients/${clientId}/invoices`, fd);
      reload();
      onChanged();
    }, "Invoice uploaded.");

  const deleteInvoice = (invoiceId: string) =>
    run(async () => {
      await api.del(`/admin/crm/clients/${clientId}/invoices/${invoiceId}`);
      reload();
      onChanged();
    }, "Invoice deleted.");

  const deleteClient = () =>
    run(async () => {
      await api.del(`/admin/crm/clients/${clientId}`);
      setConfirmDelete(false);
      onChanged();
      onClose();
    }, "Client deleted.");

  const authorOf = (staffId: string, embedded?: string) => {
    const s = staff[staffId];
    const name = embedded ?? s?.fullName ?? (staffId === me?.staffId ? me?.fullName : undefined) ?? "Staff member";
    const role = s ? roleLabel(s.role) : staffId === me?.staffId ? roleLabel(me?.role) : "Staff";
    return { name, role };
  };

  const notes = [...(client?.internalNotes ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const invoices = [...(client?.invoiceRecords ?? [])].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
  const view = (label: string, value: string) => (
    <div>
      <div className="text-[10px] text-muted">{label}</div>
      <div className="mt-0.5 text-xs font-semibold">{value || "—"}</div>
    </div>
  );

  return (
    <>
      <Drawer
        open={!!clientId}
        onClose={onClose}
        width="max-w-[520px]"
        title={client ? `● Client Profile: ${fullName(client)}` : "Client Profile"}
        subtitle={client ? `ID: ${shortClientId(client.clientId)} • Customer since ${fmtMonthYear(client.createdAt)}` : undefined}
        headerRight={
          isAdmin && client ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3 w-3" /> Delete Client
            </Button>
          ) : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button loading={busy} disabled={!editing} onClick={saveDetails}>
              Save Changes
            </Button>
          </>
        }
      >
        {loading || !client ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : (
          <>
            <section className="rounded-2xl border border-line p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted">Client Details</h3>
                {editing ? (
                  <div className="flex gap-3 text-xs font-medium">
                    <button onClick={() => setEditing(false)} className="text-muted">
                      Cancel
                    </button>
                    <button onClick={saveDetails}>Save Changes</button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-medium">
                    <Pencil className="h-3 w-3" /> Edit Details
                  </button>
                )}
              </div>
              {editing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full Name">
                    <TextInput value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  </Field>
                  <Field label="Email Address">
                    <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </Field>
                  <Field label="Phone Number">
                    <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Physical Address">
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.physicalAddress}
                      onChange={(e) => setForm({ ...form, physicalAddress: e.target.value })}
                    />
                  </Field>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {view("Full Name", fullName(client))}
                  {view("Email Address", client.email)}
                  {view("Phone Number", client.phone)}
                  {view("Physical Address", client.physicalAddress)}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-line p-5">
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Internal Notes & Comments</h3>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this client..."
                className={inputCls}
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" loading={busy} onClick={addNote}>
                  <MessageSquare className="h-3 w-3" /> Add Comment
                </Button>
              </div>
              <ul className="mt-4 space-y-3">
                {notes.map((n) => {
                  const a = authorOf(n.staffAccountId, n.author?.fullName);
                  const canDelete = isAdmin || n.staffAccountId === me?.staffId;
                  return (
                    <li key={n.noteId} className="grid grid-cols-[84px_1fr] gap-3">
                      <div className="pt-3 text-right text-[10px] text-muted">{fmtDateTime(n.createdAt)}</div>
                      <div className="rounded-xl bg-card p-3.5">
                        <p className="whitespace-pre-wrap text-xs leading-relaxed">{n.content}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[10px] text-muted">
                            <Avatar name={a.name} size={18} /> {a.role}
                          </span>
                          {canDelete && (
                            <button onClick={() => deleteNote(n.noteId)} className="text-muted hover:text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
                {notes.length === 0 && <li className="text-center text-xs text-muted">No notes yet.</li>}
              </ul>
            </section>

            <section className="rounded-2xl border border-line p-5">
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Invoice Records</h3>
              <Dropzone
                title="Upload Invoice/Receipt"
                hint="Drag and drop PDF files here, or click to browse"
                accept=".pdf,.png,.jpg,.jpeg"
                onFiles={(files) => {
                  const ok = files.filter((f) => f.size <= 10 * 1024 * 1024);
                  if (ok.length < files.length) toast("Files over 10 MB were skipped.", "err");
                  if (ok.length) uploadInvoices(ok);
                }}
              />
              <ul className="mt-4 space-y-2">
                {invoices.map((i) => (
                  <li key={i.invoiceId} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{i.fileName}</div>
                      <div className="text-[10px] text-muted">{fmtDate(i.uploadedAt)}</div>
                    </div>
                    <a href={i.fileUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-ink">
                      <Download className="h-4 w-4" />
                    </a>
                    <button onClick={() => deleteInvoice(i.invoiceId)} className="text-muted hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this client?"
        message="This permanently removes the client record. This can't be undone."
        loading={busy}
        onConfirm={deleteClient}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

export function CreateClientDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open]);

  async function save() {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast("Name, email and phone are required.", "err");
      return;
    }
    setBusy(true);
    try {
      await api.post("/admin/crm/clients", form);
      toast("Client created.");
      onCreated();
      onClose();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create New Client"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={save}>
            Save New Client
          </Button>
        </>
      }
    >
      <Field label="Full Name">
        <TextInput placeholder="Enter full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      </Field>
      <Field label="Email Address">
        <TextInput type="email" placeholder="client@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label="Phone Number">
        <TextInput placeholder="+27 12 213 3249" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Field>
      <Field label="Physical Address">
        <textarea
          rows={4}
          className={inputCls}
          placeholder="Enter full address"
          value={form.physicalAddress}
          onChange={(e) => setForm({ ...form, physicalAddress: e.target.value })}
        />
      </Field>
    </Drawer>
  );
}