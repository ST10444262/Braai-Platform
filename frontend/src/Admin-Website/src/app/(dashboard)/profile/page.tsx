"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Monitor, Trash2, Smartphone, Laptop } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { roleLabel } from "@/lib/format";
import { Avatar, Button, ErrorNote, Field, Modal, Pill, Spinner, TextInput, useToast } from "@/components/ui";

interface Setup {
  sharedKey?: string;
  authenticatorUri?: string;
  challengeToken?: string;
}

interface TrustedDevice {
  id: string;
  deviceName: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

//------------------------------------------------------------------------------------------//
export default function ProfilePage() {
  const { me, role, ready, reloadMe } = useAuth();
  const toast = useToast();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [prefBusy, setPrefBusy] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Fetch trusted devices
  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const res = await api.get<TrustedDevice[]>("/admin/account/me/devices");
      setTrustedDevices(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (ready && me) {
      fetchDevices();
    }
  }, [ready, me]);

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
      setSetup(await api.post<Setup>("/admin/account/me/2fa/setup"));
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    try {
      if (!setup?.challengeToken) throw new Error("Missing challenge token.");
      await api.post("/admin/account/2fa/verify", { code: code.trim(), challenge: setup.challengeToken });
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

  async function toggleQuoteEmails() {
    setPrefBusy(true);
    try {
      await api.put("/admin/account/me/preferences", { receiveQuoteEmails: !me?.receiveQuoteEmails });
      toast(`Quote emails ${!me?.receiveQuoteEmails ? "enabled" : "disabled"}.`);
      await reloadMe();
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setPrefBusy(false);
    }
  }

  async function revokeDevice(id: string) {
    if (!window.confirm("Are you sure you want to revoke this device? You will need to use 2FA next time you log in on it.")) return;
    try {
      await api.del(`/admin/account/me/devices/${id}`);
      toast("Device revoked.");
      fetchDevices();
    } catch (err) {
      toast((err as Error).message, "err");
    }
  }

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
      <p className="mb-8 mt-2 text-sm text-muted">Manage your personal information, security preferences, and administrative settings.</p>

      <div className="grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <div className="rounded-3xl border border-line bg-white p-6 text-center shadow-sm">
          <div className="flex justify-center">
            <Avatar name={me.fullName} size={96} />
          </div>
          <h2 className="mt-4 text-base font-semibold">{me.fullName}</h2>
          <p className="text-xs text-muted">{me.email}</p>
          <div className="mt-2">
            <Pill tone="red">{roleLabel(role).toUpperCase()}</Pill>
          </div>
          <dl className="mt-6 space-y-3 text-left text-[11px]">
            {[
              ["Timezone", "South Africa/Cape Town (SAST)"],
              ["Language", "English (US)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-5">
          <form onSubmit={updatePassword} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
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
            <Button type="submit" loading={pwBusy} className="mt-5">
              Update Password
            </Button>
          </form>

          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Two-Factor Authentication & Trusted Devices</h3>
                <p className="mt-1 max-w-xs text-xs text-muted">
                  Manage your authenticator app and the devices that are allowed to skip 2FA.
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                  <span className={me.twoFactorEnabled ? "h-1.5 w-1.5 rounded-full bg-emerald-500" : "h-1.5 w-1.5 rounded-full bg-stone-300"} />
                  {me.twoFactorEnabled ? "2FA Enabled" : "2FA not enabled"}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setTwoFaOpen(true)}>
                Manage Authenticator
              </Button>
            </div>

            {trustedDevices.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Trusted Devices</h4>
                <div className="space-y-3">
                  {trustedDevices.map((device) => {
                    const isMobile = device.deviceName.toLowerCase().includes("mobi") || device.deviceName.toLowerCase().includes("android") || device.deviceName.toLowerCase().includes("iphone");
                    const Icon = isMobile ? Smartphone : Laptop;
                    
                    return (
                      <div key={device.id} className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-xs truncate max-w-[200px]" title={device.deviceName}>
                              {device.deviceName}
                            </p>
                            <p className="text-[11px] text-muted">
                              Added: {new Date(device.createdAt).toLocaleDateString()} • Last used: {new Date(device.lastUsedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => revokeDevice(device.id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors"
                          title="Revoke device"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold">Email Notifications</h3>
              <p className="mt-1 max-w-xs text-xs text-muted">
                Receive an email notification every time a new quote request is submitted by a customer.
              </p>
            </div>
            <Button variant={me.receiveQuoteEmails ? "secondary" : "primary"} loading={prefBusy} onClick={toggleQuoteEmails}>
              {me.receiveQuoteEmails ? "Disable" : "Enable"}
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
            {setup.sharedKey && (
              <p className="break-all rounded-lg bg-card px-3 py-2 text-center font-mono text-xs">{setup.sharedKey}</p>
            )}
            <p className="text-xs text-muted">Scan the QR code (or type the key in manually), then enter the 6-digit code it shows.</p>
            <TextInput value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" />
          </div>
        )}
      </Modal>
    </>
  );
}
//---------------------END OF FILE------------------------------------------------------------------//