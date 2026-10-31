"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Shell";
import { Button, ErrorNote, Field, TextInput } from "@/components/ui";
import { QRCodeSVG } from "qrcode.react";
import { Info } from "lucide-react";

//------------------------------------------------------------------------------------------//
export default function LoginPage() {
  const router = useRouter();
  const { login, verifyTwoFactor, setupTwoFactor, finishSetupTwoFactor, role, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);

  // States to track flow
  const [userId, setUserId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupDetails, setSetupDetails] = useState<{ authenticatorUri: string; sharedKey: string } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && role) router.replace("/overview");
  }, [ready, role, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isSettingUp && challenge) {
        // The setup verification step
        await finishSetupTwoFactor(challenge, code.trim());

        const res = await login(email.trim(), password);
        if (res.requiresTwoFactor && res.userId) {
          // Now we can actually verify it to get the token
          await verifyTwoFactor(res.userId, code.trim(), res.twoFactorChallenge);
          router.replace("/overview");
        } else {
          router.replace("/overview");
        }
      } else if (userId && challenge) {
        // Standard 2FA verification step
        await verifyTwoFactor(userId, code.trim(), challenge, rememberDevice);
        router.replace("/overview");
      } else {
        // Initial login step
        const res = await login(email.trim(), password);

        if (res.requiresTwoFactorSetup && res.twoFactorChallenge) {
          setChallenge(res.twoFactorChallenge);
          setIsSettingUp(true);
          const setup = await setupTwoFactor(res.twoFactorChallenge);
          setSetupDetails(setup);
        } else if (res.requiresTwoFactor && res.userId && res.twoFactorChallenge) {
          setUserId(res.userId);
          setChallenge(res.twoFactorChallenge);
        } else {
          router.replace("/overview");
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-sand px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-8 shadow-sm">
        <Logo />
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {isSettingUp ? "Set up 2FA" : userId ? "Two-factor check" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted inline-flex items-center justify-center gap-1">
            {isSettingUp
              ? "Scan this QR code with your authenticator app to secure your account."
              : userId
                ? "Enter the 6-digit code from your authenticator app."
                : "Sign in to the staff dashboard."}
            {/* Legal notice tooltip — only shown on the initial credential step */}
            {!isSettingUp && !userId && (
              <span className="group relative inline-flex">
                <Info className="h-3.5 w-3.5 cursor-help text-muted/60 hover:text-muted transition-colors" aria-label="Legal notice" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white p-3.5 text-left text-[10px] leading-relaxed text-stone-600 shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <span className="mb-1 block font-semibold text-stone-800">Restricted — Authorised Inflame Staff Only</span>
                  Unauthorised access, credential stuffing, or attempts to bypass authentication or Two-Factor
                  Authentication are prohibited and constitute a criminal offence under the{" "}
                  <strong className="text-stone-700">Cybercrimes Act 19 of 2020</strong>. By logging in, you consent
                  to the logging of your IP address, session activity, client record views, enquiry status changes,
                  notes and file uploads for security auditing, in accordance with{" "}
                  <strong className="text-stone-700">POPIA</strong>.
                </span>
              </span>
            )}
          </p>
        </div>

        {error && <ErrorNote message={error} />}

        {isSettingUp && setupDetails && (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-100">
              <QRCodeSVG value={setupDetails.authenticatorUri} size={160} />
            </div>
            <p className="text-xs text-center text-muted font-mono tracking-wide">
              {setupDetails.sharedKey}
            </p>
            <div className="w-full">
              <Field label="Verification code">
                <TextInput
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  autoFocus
                  required
                />
              </Field>
            </div>
          </div>
        )}

        {!isSettingUp && userId && (
          <div className="space-y-4">
            <Field label="Authenticator code">
              <TextInput
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                autoFocus
                required
              />
            </Field>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember this device for 14 days
              </label>
            </div>
          </div>
        )}

        {!isSettingUp && !userId && (
          <>
            <Field label="Email">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@inflame.co.za"
                required
              />
            </Field>
            <Field label="Password">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          </>
        )}

        <Button type="submit" loading={busy} className="w-full">
          {isSettingUp
            ? "Complete Setup"
            : userId
              ? "Verify and sign in"
              : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
//---------------------END OF FILE------------------------------------------------------------------//