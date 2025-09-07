"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  FileText,
  Users,
  Activity,
  BarChart2,
  Flag,
  FlaskConical,
  Menu,
  X,
  Search,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import LogoutButton from "@/components/LogoutButton";
// import * as Tooltip from "@radix-ui/react-tooltip"; // optional if you want tooltips on collapsed items

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const primary: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pages", href: "/page", icon: FileText },
  { label: "Broadcasts", href: "/broadcast", icon: Mail },
  { label: "Sequences", href: "/sequence", icon: FlaskConical },
  { label: "Audience", href: "/audience", icon: Users },
];

const analytics: NavItem[] = [
  {
    label: "Deliverability",
    href: "/analytics/deliverability",
    icon: Activity,
  },
  {
    label: "Broadcast Analytics",
    href: "/analytics/broadcast/1",
    icon: BarChart2,
  },
];

const ops: NavItem[] = [
  { label: "Queues", href: "/ops/queues", icon: Activity },
  { label: "RUM", href: "/ops/rum", icon: Activity },
  { label: "Flags", href: "/admin/flags", icon: Flag },
];

export default function AppShell({
  children,
  hideTopSearch = false,
}: {
  children: React.ReactNode;
  /** When true, hides the top Search/Jump button (use on /dashboard to avoid duplication) */
  hideTopSearch?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const path = usePathname();
  // Adaptive theme class selection
  React.useEffect(() => {
    const clsList = document.body.classList;
    clsList.remove("theme-dashboard", "theme-analytics");
    if (path.startsWith("/analytics")) clsList.add("theme-analytics");
    else if (path.startsWith("/dashboard")) clsList.add("theme-dashboard");
  }, [path]);

  return (
    <div className="relative min-h-dvh flex text-[var(--ink)] bg-transparent">
      {/* Removed grid overlay for cleaner background; radial fade optional */}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--card),var(--ink)_4%)]/65 backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)]/60 relative z-10">
        <div className="h-14 flex items-center px-5 border-b border-[var(--border)]/60 font-semibold tracking-tight text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="size-6 grid place-items-center rounded-md bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold shadow-sm">
              KB
            </span>
            <span className="hidden xl:inline">Kit Builders</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-7 text-sm custom-scroll thin">
          <NavGroup label="Product">
            {primary.map((i) => (
              <NavLink key={i.href} item={i} active={path.startsWith(i.href)} />
            ))}
          </NavGroup>
          <NavGroup label="Analytics">
            {analytics.map((i) => (
              <NavLink key={i.href} item={i} active={path.startsWith(i.href)} />
            ))}
          </NavGroup>
          <NavGroup label="Ops & Admin">
            {ops.map((i) => (
              <NavLink key={i.href} item={i} active={path.startsWith(i.href)} />
            ))}
          </NavGroup>
        </nav>
        <div className="p-4 border-t border-[var(--border)]/60 text-[10px] flex items-center justify-between tracking-wide uppercase">
          <span className="text-[var(--muted)]">v0.1.0</span>
          <LogoutButton />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 relative z-10">
        <TopBar
          onOpenMobile={() => setMobileOpen(true)}
          hideTopSearch={hideTopSearch}
        />
        <div className="px-6 md:px-10 pb-8 pt-2 md:pt-4 space-y-12 max-w-[1280px] mx-auto">
          {/* first-child top spacing guard */}
          <div className="[&>*:first-child]:mt-2 md:[&>*:first-child]:mt-0">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile sidebar sheet */}
      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        path={path}
      />
    </div>
  );
}

/* ---------- Top bar ---------- */

function TopBar({
  onOpenMobile,
  hideTopSearch,
}: {
  onOpenMobile: () => void;
  hideTopSearch?: boolean;
}) {
  // Subtle scroll state to solidify bar & add shadow once user scrolls
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const baseBar =
    "sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-8 border-b transition-colors duration-300 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg),var(--ink)_6%)]/65";
  const resting =
    "bg-[color-mix(in_srgb,var(--bg),var(--ink)_4%)]/55 border-[var(--border)]/50";
  const elevated =
    "bg-[color-mix(in_srgb,var(--bg),var(--ink)_10%)]/80 border-[var(--border)]/70 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08),0_0_0_1px_var(--border)]";
  return (
    <div className={baseBar + " " + (scrolled ? elevated : resting) + " mb-6"}>
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onOpenMobile}
          className="md:hidden inline-flex items-center justify-center size-9 rounded-lg border border-[var(--border)]/70 bg-[var(--card)]/80 hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </button>

        {/* Optional Search/Jump button (hidden on dashboard via prop) */}
        {!hideTopSearch && (
          <button
            onClick={() =>
              document.dispatchEvent(new CustomEvent("open-shortcuts"))
            }
            className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-[var(--border)]/70 text-[var(--fs-sm)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] transition-colors"
          >
            <Search className="size-4 opacity-70" />
            <span className="opacity-80">Search / Jump</span>
            <kbd className="text-[10px] px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--card)]">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <LogoutButton />
      </div>
    </div>
  );
}

/* ---------- Desktop nav helpers ---------- */

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="px-2 text-[10px] font-medium tracking-wide uppercase text-[var(--muted)]/80">
        {label}
      </div>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        data-active={active ? "true" : "false"}
        aria-current={active ? "page" : undefined}
        className={
          "ring-active group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm font-medium border border-transparent hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] " +
          (active
            ? "bg-[color-mix(in_srgb,var(--card),var(--ink)_8%)] text-[var(--ink)]"
            : "text-[var(--muted)]")
        }
      >
        <Icon size={16} className="opacity-70 group-hover:opacity-100" />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

/* ---------- Mobile sidebar (Radix Dialog) ---------- */

function MobileSidebar({
  open,
  onOpenChange,
  path,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  path: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 animate-in fade-in-20" />
        <Dialog.Content className="fixed z-50 top-0 left-0 h-full w-[86%] max-w-[320px] bg-[var(--card)] shadow-xl border-r border-[var(--border)] outline-none animate-in slide-in-from-bottom-2 md:hidden">
          <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)]/60">
            <span className="inline-flex items-center gap-2 font-semibold tracking-tight text-sm">
              <span className="size-6 grid place-items-center rounded-md bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold shadow-sm">
                KB
              </span>
              Kit Builders
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center size-9 rounded-lg border border-[var(--border)]/70 bg-[var(--card)]/80 hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] transition-colors"
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="px-3 py-5 space-y-7 text-sm overflow-y-auto custom-scroll thin">
            <NavGroup label="Product">
              {primary.map((i) => (
                <MobileNavLink
                  key={i.href}
                  item={i}
                  active={path.startsWith(i.href)}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </NavGroup>
            <NavGroup label="Analytics">
              {analytics.map((i) => (
                <MobileNavLink
                  key={i.href}
                  item={i}
                  active={path.startsWith(i.href)}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </NavGroup>
            <NavGroup label="Ops & Admin">
              {ops.map((i) => (
                <MobileNavLink
                  key={i.href}
                  item={i}
                  active={path.startsWith(i.href)}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </NavGroup>
          </nav>

          <div className="p-4 border-t border-[var(--border)]/60 flex items-center justify-between">
            <span className="text-[10px] tracking-wide uppercase text-[var(--muted)]">
              v0.1.0
            </span>
            <LogoutButton />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MobileNavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={
          "group flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium border border-transparent hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] " +
          (active
            ? "bg-[color-mix(in_srgb,var(--card),var(--ink)_8%)] text-[var(--ink)]"
            : "text-[var(--muted)]")
        }
      >
        <Icon size={16} className="opacity-70 group-hover:opacity-100" />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}
