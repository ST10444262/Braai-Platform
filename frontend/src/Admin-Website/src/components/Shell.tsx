"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Funnel, LayoutDashboard, LogOut, Menu, Package, UserRound, UserRoundCog, Users, X } from "lucide-react";
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

function NavList({ pathname, isAdmin, tall }: { pathname: string; isAdmin: boolean; tall?: boolean }) {
  return (
    <nav aria-label="Main navigation" className="mt-10 space-y-1">
      {NAV.filter((n) => !n.admin || isAdmin).map((n) => {
        const active = pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition",
              tall ? "py-3.5 text-sm" : "py-2.5",
              active ? "bg-stone-200/80 text-ink" : "text-stone-600 hover:bg-stone-200/50",
            )}
          >
            <n.icon className="h-4 w-4" aria-hidden="true" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { me, role, isAdmin, logout } = useAuth();
  const [menu, setMenu] = useState(false); // desktop profile dropdown
  const [navOpen, setNavOpen] = useState(false); // mobile slide-out navigation
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Stop the page scrolling behind the open mobile menu
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside aria-label="Sidebar navigation" className="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col bg-sand px-4 py-6 md:flex">
        <Logo />
        <NavList pathname={pathname} isAdmin={isAdmin} />
      </aside>

      {/* Mobile slide-out navigation */}
      <div className={cn("fixed inset-0 z-40 md:hidden", navOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
          className={cn("absolute inset-0 bg-black/30 transition-opacity", navOpen ? "opacity-100" : "opacity-0")}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={cn(
            "absolute left-0 top-0 flex h-dvh w-[280px] max-w-[85vw] flex-col bg-sand px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] shadow-2xl transition-transform duration-300",
            navOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            onClick={() => setNavOpen(false)}
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-stone-200/60"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <Logo />
          <NavList pathname={pathname} isAdmin={isAdmin} tall />

          <div className="mt-auto space-y-1 border-t border-stone-300/70 pt-4">
            <div className="flex items-center gap-3 px-3 pb-2">
              <Avatar name={me?.fullName ?? "?"} size={36} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{me?.fullName}</div>
                <div className="text-[11px] text-muted">{roleLabel(role)}</div>
              </div>
            </div>
            <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-stone-700 hover:bg-stone-200/50">
              <UserRound className="h-4 w-4" aria-hidden="true" /> My Profile
            </Link>
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        </aside>
      </div>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/90 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:hidden">
          <button
            onClick={() => setNavOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-lg hover:bg-card"
            aria-label="Open menu"
            aria-expanded={navOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link href="/overview" className="text-xl font-extrabold lowercase tracking-tight text-brand">
            inflame
          </Link>
          <Link href="/profile" className="grid h-11 w-11 place-items-center" aria-label="My profile">
            <Avatar name={me?.fullName ?? "?"} size={32} />
          </Link>
        </header>

        {/* Desktop top bar */}
        <header className="hidden justify-end px-10 pt-5 md:flex">
          <div ref={menuRef} className="relative flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-2 shadow-sm">
            <Bell className="h-4 w-4 text-muted" aria-hidden="true" />
            <button
              onClick={() => setMenu((m) => !m)}
              aria-haspopup="menu"
              aria-expanded={menu}
              className="flex items-center gap-2"
            >
              <Avatar name={me?.fullName ?? "?"} size={28} />
              <span className="text-xs font-semibold">{roleLabel(role)}</span>
            </button>
            {menu && (
              <div role="menu" aria-label="User account options" className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl border border-line bg-white p-1.5 shadow-lg">
                <div className="px-3 py-2 text-xs text-muted">{me?.email}</div>
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-card"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" /> My Profile
                </Link>
                <button
                  role="menuitem"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="px-4 pb-16 pt-6 md:px-10 md:pt-8">{children}</main>
      </div>
    </div>
  );
}