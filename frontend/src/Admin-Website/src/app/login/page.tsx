"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Shell";
import { Button, ErrorNote, Field, TextInput } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyTwoFactor, role, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
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
      if (userId) {
        await verifyTwoFactor(userId, code.trim());
        router.replace("/overview");
      } else {
        const res = await login(email.trim(), password);
        if (res.requiresTwoFactor && res.userId) setUserId(res.userId);
        else router.replace("/overview");
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
          <h1 className="text-2xl font-bold">{userId ? "Two-factor check" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted">
            {userId ? "Enter the 6-digit code from your authenticator app." : "Sign in to the staff dashboard."}
          </p>
        </div>
        {error && <ErrorNote message={error} />}
        {userId ? (
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
        ) : (
          <>
            <Field label="Email">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@inflame.co.za" required />
            </Field>
            <Field label="Password">
              <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
          </>
        )}
        <Button type="submit" loading={busy} className="w-full">
          {userId ? "Verify and sign in" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}