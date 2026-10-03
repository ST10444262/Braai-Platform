"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Funnel, LayoutDashboard, LogOut, Package, UserRound, UserRoundCog, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { roleLabel } from "@/lib/format";
import { Avatar, cn } from "./ui";

const NAV = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/products", label: "Product Catalogue", icon: Package },
  { href: "/leads", label: "Lead Management", icon: Funnel },
  { href: "/clients", label: "Client Directory", icon: Users },
  { href: "/users", label: "Users", icon: UserRoundCog, admin: true },
];

export function Logo() {
  // Swap this for <Image src="/inflame-logo.png" .../> once the logo file is in /public
  return (
    <div className="text-center">
      <div className="inline-block rounded bg-white px-3 py-1">
        <span className="text-[26px] font-extrabold lowercase leading-none tracking-tight text-brand">inflame</span>
      </div>
      <div className="mt-1 text-[9px] font-medium tracking-[0.2em] text-muted">ADMIN PLATFORM</div>
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { me, role, isAdmin, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col bg-sand px-4 py-6 md:flex">
        <Logo />
        <nav className="mt-10 space-y-1">
          {NAV.filter((n) => !n.admin || isAdmin).map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition",
                  active ? "bg-stone-200/80 text-ink" : "text-stone-600 hover:bg-stone-200/50",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex justify-end px-6 pt-5 md:px-10">
          <div ref={menuRef} className="relative flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-2 shadow-sm">
            <Bell className="h-4 w-4 text-muted" />
            <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2">
              <Avatar name={me?.fullName ?? "?"} size={28} />
              <span className="text-xs font-semibold">{roleLabel(role)}</span>
            </button>
            {menu && (
              <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl border border-line bg-white p-1.5 shadow-lg">
                <div className="px-3 py-2 text-xs text-muted">{me?.email}</div>
                <Link
                  href="/profile"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-card"
                >
                  <UserRound className="h-4 w-4" /> My Profile
                </Link>
                <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="px-6 pb-16 pt-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}