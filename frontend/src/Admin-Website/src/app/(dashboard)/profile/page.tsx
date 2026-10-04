"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { roleLabel } from "@/lib/format";
import { Avatar, Button, ErrorNote, Field, Modal, Pill, Spinner, TextInput, useToast } from "@/components/ui";

interface Setup {
  sharedKey?: string;
  authenticatorUri?: string;
}

export default function ProfilePage() {
  const { me, role, ready, reloadMe } = useAuth();
  const toast = useToast();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return <Spinner />;
  if (!me) return <ErrorNote message="Could not load your profile." />;

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next.length < 12 || /^[a-zA-Z0-9]*$/.test(pw.next)) return toast("Use at least 12 characters including a special character.", "err");
    if (pw.next !== pw.confirm) return toast("The new passwords don't match.", "err");
    setPwBusy(true);
    try {
      await api.post("/admin/account/change-password", { currentPassword: pw.current, newPassword: pw.next });
      toast("Password updated.");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setPwBusy(false);
    }
  }

  async function startSetup() {
    setBusy(true);
    try {
      setSetup(await api.post<Setup>("/admin/account/2fa/setup"));
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    try {
      await api.post("/admin/account/2fa/verify", { code: code.trim() });
      toast("Two-factor authentication enabled.");
      setTwoFaOpen(false);
      setSetup(null);
      setCode("");
      await reloadMe();
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  function closeModal() {
    setTwoFaOpen(false);
    setSetup(null);
    setCode("");
  }

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My Profile</h1>
      <p className="mb-6 mt-2 text-sm text-muted md:mb-8">Manage your personal information, security preferences, and administrative settings.</p>

      <div className="grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <div className="rounded-3xl border border-line bg-white p-5 text-center shadow-sm sm:p-6">
          <div className="flex justify-center">
            <Avatar name={me.fullName} size={96} />
          </div>
          <h2 className="mt-4 text-base font-semibold">{me.fullName}</h2>
          <p className="break-all text-xs text-muted">{me.email}</p>
          <div className="mt-2">
            <Pill tone="red">{roleLabel(role).toUpperCase()}</Pill>
          </div>
          <dl className="mt-6 space-y-3 text-left text-[11px]">
            {[
              ["Timezone", "South Africa/Cape Town (SAST)"],
              ["Language", "English (US)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-5">
          <form onSubmit={updatePassword} className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-semibold">Security & Authentication</h3>
            <p className="mb-5 text-xs text-muted">Update your password and secure your account.</p>
            <div className="space-y-4">
              <Field label="Current Password">
                <TextInput type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
              </Field>
              <Field label="New Password" hint="Must be at least 12 characters and contain special characters.">
                <TextInput type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
              </Field>
              <Field label="Confirm New Password">
                <TextInput type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
              </Field>
            </div>
            <Button type="submit" loading={pwBusy} className="mt-5 w-full sm:w-auto">
              Update Password
            </Button>
          </form>

          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-sm font-semibold">Two-Factor Authentication</h3>
              <p className="mt-1 max-w-xs text-xs text-muted">
                Add an extra layer of security to your account by requiring more than just your password to sign in.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                <span className={me.twoFactorEnabled ? "h-1.5 w-1.5 rounded-full bg-emerald-500" : "h-1.5 w-1.5 rounded-full bg-stone-300"} />
                {me.twoFactorEnabled ? "2FA Enabled" : "2FA not enabled"}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setTwoFaOpen(true)} className="w-full shrink-0 sm:w-auto">
              Manage 2FA Devices
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={twoFaOpen}
        onClose={closeModal}
        title="Authenticator app"
        footer={
          setup ? (
            <>
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button loading={busy} disabled={code.trim().length < 6} onClick={verify}>
                Verify and enable
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
              <Button loading={busy} onClick={startSetup}>
                {me.twoFactorEnabled ? "Set up a new device" : "Start setup"}
              </Button>
            </>
          )
        }
      >
        {!setup ? (
          <div className="flex gap-3 text-sm text-muted">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p>
              {me.twoFactorEnabled
                ? "2FA is already enabled. Setting up a new device generates a new key; confirm it with a code to replace the old one."
                : "Use Microsoft Authenticator (or any TOTP app) to generate sign-in codes."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {setup.authenticatorUri && (
              <div className="flex justify-center rounded-xl bg-card p-4">
                <QRCodeSVG value={setup.authenticatorUri} size={160} />
              </div>
            )}
            {setup.sharedKey && <p className="break-all rounded-lg bg-card px-3 py-2 text-center font-mono text-xs">{setup.sharedKey}</p>}
            <p className="text-xs text-muted">Scan the QR code (or type the key in manually), then enter the 6-digit code it shows.</p>
            <TextInput value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" />
          </div>
        )}
      </Modal>
    </>
  );
}