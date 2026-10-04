"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Shell from "@/components/Shell";
import { Spinner } from "@/components/ui";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { ready, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !role) router.replace("/login");
  }, [ready, role, router]);

  if (!ready || !role) return <Spinner className="min-h-screen" />;
  return <Shell>{children}</Shell>;
}