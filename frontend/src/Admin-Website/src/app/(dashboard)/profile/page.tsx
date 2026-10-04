"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  Trash2,
  Smartphone,
  Laptop,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { roleLabel } from "@/lib/format";

import {
  Avatar,
  Button,
  ErrorNote,
  Field,
  Modal,
  Pill,
  Spinner,
  TextInput,
  useToast,
} from "@/components/ui";


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


export default function ProfilePage() {
  const { me, role, ready, reloadMe } = useAuth();
  const toast = useToast();

  // Password
  const [pw, setPw] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [pwBusy, setPwBusy] = useState(false);

  // 2FA
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // Email preferences
  const [prefBusy, setPrefBusy] = useState(false);

  // Trusted devices
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);


  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);

      const res = await api.get<TrustedDevice[]>(
        "/admin/account/me/devices",
      );

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


  if (!ready) {
    return <Spinner />;
  }

  if (!me) {
    return <ErrorNote message="Could not load your profile." />;
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (pw.next !== pw.confirm) {
      toast("New passwords do not match.", "err");
      return;
    }

    if (pw.next.length < 8) {
      toast(
        "Your new password must be at least 8 characters long.",
        "err",
      );
      return;
    }

    setPwBusy(true);

    try {
      await api.post("/admin/account/change-password", {
        currentPassword: pw.current,
        newPassword: pw.next,
      });

      toast("Password updated successfully.");

      setPw({
        current: "",
        next: "",
        confirm: "",
      });
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setPwBusy(false);
    }
  }

  async function startSetup() {
    setBusy(true);

    try {
      const result = await api.post<Setup>(
        "/admin/account/2fa/setup",
      );

      setSetup(result);
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }


  async function verify() {
    if (!code.trim()) {
      toast(
        "Enter the 6-digit code from your authenticator app.",
        "err",
      );
      return;
    }

    setBusy(true);

    try {
      await api.post("/admin/account/2fa/verify", {
        code: code.trim(),
      });

      toast("Two-factor authentication enabled.");

      setTwoFaOpen(false);
      setSetup(null);
      setCode("");

      await reloadMe();
      await fetchDevices();
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }


  async function openTwoFactor() {
    setTwoFaOpen(true);

    if (!me.twoFactorEnabled) {
      await startSetup();
    }
  }


  function closeTwoFactor() {
    if (busy) return;

    setTwoFaOpen(false);
    setSetup(null);
    setCode("");
  }

  async function toggleQuoteEmails() {
    setPrefBusy(true);

    try {
      const newValue = !me.receiveQuoteEmails;

      await api.put("/admin/account/me/preferences", {
        receiveQuoteEmails: newValue,
      });

      toast(
        `Quote emails ${newValue ? "enabled" : "disabled"}.`,
      );

      await reloadMe();
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setPrefBusy(false);
    }
  }


  async function revokeDevice(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this device? You will need to use 2FA next time you log in on it.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.del(`/admin/account/me/devices/${id}`);

      toast("Device revoked.");

      await fetchDevices();
    } catch (err) {
      toast((err as Error).message, "err");
    }
  }


  return (
    <>
      {/* PAGE HEADER */}

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        My Profile
      </h1>

      <p className="mb-6 mt-2 text-sm text-muted md:mb-8">
        Manage your personal information, security preferences, and
        administrative settings.
      </p>

   

      <div className="grid items-start gap-5 lg:grid-cols-[340px_1fr]">

        <div className="rounded-3xl border border-line bg-white p-5 text-center shadow-sm sm:p-6">

          <div className="flex justify-center">
            <Avatar name={me.fullName} size={96} />
          </div>

          <h2 className="mt-4 text-base font-semibold">
            {me.fullName}
          </h2>

          <p className="break-all text-xs text-muted">
            {me.email}
          </p>

          <div className="mt-2">
            <Pill tone="red">
              {roleLabel(role).toUpperCase()}
            </Pill>
          </div>

          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-xs">

            {[
              ["Full Name", me.fullName],
              ["Email", me.email],
              ["Role", roleLabel(role)],
              ["Timezone", "South Africa/Cape Town (SAST)"],
              ["Language", "English (US)"],
            ].map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-3"
              >
                <dt className="text-muted">
                  {key}
                </dt>

                <dd className="text-right font-medium">
                  {value}
                </dd>
              </div>
            ))}

          </dl>
        </div>


        <div className="space-y-5">


          <form
            onSubmit={updatePassword}
            className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6"
          >
            <h3 className="text-sm font-semibold">
              Security & Authentication
            </h3>

            <p className="mb-5 text-xs text-muted">
              Update your password and secure your account.
            </p>

            <div className="space-y-4">

              <Field label="Current Password">
                <TextInput
                  type="password"
                  value={pw.current}
                  onChange={(e) =>
                    setPw({
                      ...pw,
                      current: e.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="New Password">
                <TextInput
                  type="password"
                  value={pw.next}
                  onChange={(e) =>
                    setPw({
                      ...pw,
                      next: e.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Confirm New Password">
                <TextInput
                  type="password"
                  value={pw.confirm}
                  onChange={(e) =>
                    setPw({
                      ...pw,
                      confirm: e.target.value,
                    })
                  }
                  required
                />
              </Field>

            </div>

            <Button
              type="submit"
              loading={pwBusy}
              className="mt-5 w-full sm:w-auto"
            >
              Update Password
            </Button>
          </form>


          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">

            

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-sm font-semibold">
                  Two-Factor Authentication & Trusted Devices
                </h3>

                <p className="mt-1 max-w-md text-xs text-muted">
                  Manage your authenticator app and the devices that
                  are allowed to skip 2FA.
                </p>

                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                  <span
                    className={
                      me.twoFactorEnabled
                        ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                        : "h-1.5 w-1.5 rounded-full bg-stone-300"
                    }
                  />

                  {me.twoFactorEnabled
                    ? "2FA Enabled"
                    : "2FA not enabled"}
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={openTwoFactor}
                className="w-full shrink-0 sm:w-auto"
              >
                Manage Authenticator
              </Button>

            </div>


            {loadingDevices ? (

              <div className="mt-4 border-t border-line pt-4">
                <div className="py-4">
                  <Spinner />
                </div>
              </div>

            ) : trustedDevices.length > 0 ? (

              <div className="mt-4 border-t border-line pt-4">

                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Trusted Devices
                </h4>

                <div className="space-y-3">

                  {trustedDevices.map((device) => {
                    const deviceName =
                      device.deviceName.toLowerCase();

                    const isMobile =
                      deviceName.includes("mobi") ||
                      deviceName.includes("android") ||
                      deviceName.includes("iphone");

                    const Icon = isMobile
                      ? Smartphone
                      : Laptop;

                    return (
                      <div
                        key={device.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3 text-sm"
                      >

                     

                        <div className="flex min-w-0 items-center gap-3">

                      

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm">
                            <Icon size={18} />
                          </div>

                  

                          <div className="min-w-0">

                            <p
                              className="max-w-[200px] truncate text-xs font-medium sm:max-w-[350px]"
                              title={device.deviceName}
                            >
                              {device.deviceName}
                            </p>

                            <p className="mt-0.5 text-[11px] text-muted">
                              Added:{" "}
                              {new Date(
                                device.createdAt,
                              ).toLocaleDateString()}
                              {" • "}
                              Last used:{" "}
                              {new Date(
                                device.lastUsedAt,
                              ).toLocaleDateString()}
                            </p>

                          </div>
                        </div>

               

                        <button
                          type="button"
                          onClick={() =>
                            revokeDevice(device.id)
                          }
                          className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                          title="Revoke device"
                          aria-label={`Revoke ${device.deviceName}`}
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    );
                  })}

                </div>
              </div>

            ) : (

              <div className="mt-4 border-t border-line pt-4">

                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  Trusted Devices
                </h4>

                <p className="text-xs text-muted">
                  No trusted devices are currently saved.
                </p>

              </div>

            )}

          </div>


          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>
              <h3 className="text-sm font-semibold">
                Email Notifications
              </h3>

              <p className="mt-1 max-w-md text-xs text-muted">
                Receive an email notification every time a new quote
                request is submitted by a customer.
              </p>

              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                <span
                  className={
                    me.receiveQuoteEmails
                      ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                      : "h-1.5 w-1.5 rounded-full bg-stone-300"
                  }
                />

                {me.receiveQuoteEmails
                  ? "Email notifications enabled"
                  : "Email notifications disabled"}
              </p>
            </div>

            <Button
              type="button"
              variant={
                me.receiveQuoteEmails
                  ? "secondary"
                  : "primary"
              }
              loading={prefBusy}
              onClick={toggleQuoteEmails}
              className="w-full shrink-0 sm:w-auto"
            >
              {me.receiveQuoteEmails
                ? "Disable"
                : "Enable"}
            </Button>

          </div>

        </div>
      </div>


      <Modal
        open={twoFaOpen}
        onClose={closeTwoFactor}
        title="Two-Factor Authentication"
      >

        {me.twoFactorEnabled ? (

          <div className="space-y-4">

            <div className="flex items-center justify-center py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            <div className="text-center">

              <h4 className="text-sm font-semibold">
                Two-factor authentication is enabled
              </h4>

              <p className="mt-2 text-xs text-muted">
                Your account is protected with an authenticator app.
                Trusted devices listed on your profile can skip the
                additional verification step when allowed.
              </p>

            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={closeTwoFactor}
              className="w-full"
            >
              Close
            </Button>

          </div>

        ) : (

          <div className="space-y-4">

            {busy && !setup ? (

              <div className="py-6">
                <Spinner />
              </div>

            ) : (
              <>

                <p className="text-xs text-muted">
                  Scan the QR code below using Google Authenticator,
                  Microsoft Authenticator, Authy, or another compatible
                  authenticator app.
                </p>

                {/* QR CODE */}

                {setup?.authenticatorUri && (
                  <div className="flex justify-center rounded-xl bg-white p-4">
                    <QRCodeSVG
                      value={setup.authenticatorUri}
                      size={160}
                    />
                  </div>
                )}

           

                {setup?.sharedKey && (
                  <div>
                    <p className="mb-2 text-center text-[11px] font-medium text-muted">
                      Manual setup key
                    </p>

                    <p className="break-all rounded-lg bg-card px-3 py-2 text-center font-mono text-xs">
                      {setup.sharedKey}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted">
                  Scan the QR code (or type the key in manually),
                  then enter the 6-digit code it shows.
                </p>

          

                <Field label="Authentication Code">
                  <TextInput
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      )
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                  />
                </Field>

                <Button
                  type="button"
                  onClick={verify}
                  loading={busy}
                  disabled={code.length !== 6}
                  className="w-full"
                >
                  Verify & Enable 2FA
                </Button>

              </>
            )}

          </div>

        )}

      </Modal>
    </>
  );
}

//---------------------END OF FILE------------------------------------------------------------------//