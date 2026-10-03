"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Shell";
import { Button, ErrorNote, Field, TextInput } from "@/components/ui";
import { QRCodeSVG } from "qrcode.react";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyTwoFactor, setupTwoFactor, finishSetupTwoFactor, role, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

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
        await verifyTwoFactor(userId, code.trim(), challenge);
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
          <p className="mt-1 text-sm text-muted">
            {isSettingUp
              ? "Scan this QR code with your authenticator app to secure your account."
              : userId
                ? "Enter the 6-digit code from your authenticator app."
                : "Sign in to the staff dashboard."}
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