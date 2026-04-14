"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Search,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/report/print", label: "Relatório", icon: FileText },
];

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh">
      {/* Global Cmd+K search — montado uma vez, escuta atalho globalmente */}
      <GlobalSearch />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card md:flex dark:bg-card/60 dark:backdrop-blur-xl">
        <div className="relative flex h-20 items-center justify-center border-b border-border px-5">
          <Logo size="md" />
        </div>

        <div className="px-3 pt-3">
          <SearchTrigger />
        </div>

        <nav className="relative flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "text-white shadow-glow"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/90 via-primary to-primary-dark"
                  />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    active ? "scale-110" : "group-hover:scale-110",
                  )}
                />
                <span className="relative z-10">{item.label}</span>
                {active && (
                  <span className="relative z-10 ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="relative border-t border-border p-3">
          {userEmail && (
            <div className="mb-2 flex items-center gap-2 px-3">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[10px] font-bold text-white">
                {userEmail[0]?.toUpperCase()}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {userEmail}
              </div>
            </div>
          )}
          <ThemeToggle variant="inline" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <MobileSearchTrigger />
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      <main className="md:pl-60">
        <div className="mx-auto w-full max-w-6xl animate-fade-in px-4 pb-24 pt-4 md:px-8 md:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur md:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {active && (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/**
 * Dispara o modal Cmd+K programaticamente via KeyboardEvent sintético.
 * O GlobalSearch tem o listener global, então basta disparar o evento.
 */
function triggerSearch() {
  const event = new KeyboardEvent("keydown", {
    key: "k",
    code: "KeyK",
    metaKey: true,
    ctrlKey: true,
    bubbles: true,
  });
  window.dispatchEvent(event);
}

function SearchTrigger() {
  const isMac =
    typeof navigator !== "undefined" && /mac/i.test(navigator.platform);

  return (
    <button
      type="button"
      onClick={triggerSearch}
      className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-foreground"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">Buscar leads...</span>
      <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold">
        {isMac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

function MobileSearchTrigger() {
  return (
    <button
      type="button"
      onClick={triggerSearch}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
      aria-label="Buscar leads"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}
