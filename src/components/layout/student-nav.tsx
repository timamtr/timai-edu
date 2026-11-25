"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  CheckSquare,
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import type { Profile } from "@/types/database";
import { logoutAction } from "@/features/auth/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Басты бет", icon: LayoutDashboard },
  { href: "/subjects", label: "Пәндер мен тақырыптар", icon: BookOpen },
  { href: "/tests", label: "Тесттер", icon: CheckSquare },
  { href: "/quiz", label: "Жылдам квиз", icon: Zap },
  { href: "/practice", label: "Практика", icon: Code2 },
  { href: "/bookmarks", label: "Таңдаулылар", icon: Bookmark },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/profile", label: "Профиль", icon: User },
];

export function StudentNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {profile.role === "admin" && (
        <div className="pt-3">
          <div className="px-3.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Басқару
          </div>
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl bg-secondary px-3.5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary/15"
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span>Админ панелі</span>
          </Link>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            TimAI <span className="text-primary">Edu</span>
          </span>
        </div>

        <NavLinks />

        <div className="border-t border-border p-4">
          <div className="mb-3 rounded-xl bg-muted/60 px-3.5 py-2.5">
            <div className="truncate text-sm font-semibold text-foreground">
              {profile.full_name || "Оқушы"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {profile.grade ? `${profile.grade}-сынып • ` : ""}
              {profile.email}
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span>Шығу</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-foreground">
            TimAI <span className="text-primary">Edu</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Мәзірді ашу"
          className="rounded-lg border border-border p-2 text-foreground hover:bg-muted"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/30 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-72 max-w-[85vw] flex-col bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-base font-bold text-foreground">
                TimAI <span className="text-primary">Edu</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <NavLinks onNavigate={() => setMobileOpen(false)} />

            <div className="border-t border-border p-4">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Шығу</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
