"use client";

// Using legacy Button variants for now to satisfy existing barrel export types
import { Button } from "@/components/ui";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Sun,
  Moon,
  Command,
  Layers,
  Mail,
  Image,
  Home,
  ChevronDown,
  Undo2,
  Redo2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "@/lib/stores/useTheme";
import { useBuilder } from "@/lib/stores/useBuilder";

const items = [
  { href: "/dashboard", name: "Dashboard" },
  { href: "/builder/page/demo", name: "Pages" },
  { href: "/builder/email/demo", name: "Emails" },
  { href: "/media", name: "Media" },
];

export default function TopBar({
  onOpenOnboarding,
  onReset,
}: {
  onOpenOnboarding?: () => void;
  onReset?: () => void;
}) {
  const pathname = usePathname();
  const toggleDark = useTheme((s) => s.toggleDark);
  const dark = useTheme((s) => s.darkPreview);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);

  // keyboard shortcuts for undo/redo (Cmd+Z / Shift+Cmd+Z)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);
  return (
   <header className="sticky top-0 z-[var(--z-topbar)] topbar">
      <div className="mx-auto max-w-[1400px] px-4 flex h-14 items-center gap-4">
        <Link
          href="/dashboard"
          className="font-semibold tracking-tight text-sm flex items-center gap-2"
        >
          <span className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] font-bold text-xs">
            K
          </span>
          <span className="hidden sm:inline">Kit Builders</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "solid" : "outline"}
              size="sm"
              className="px-3"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/builder/page/demo">
            <Button
              variant={
                pathname?.startsWith("/builder/page") ? "solid" : "outline"
              }
              size="sm"
              className="px-3"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/builder/email/demo">
            <Button
              variant={
                pathname?.startsWith("/builder/email") ? "solid" : "outline"
              }
              size="sm"
              className="px-3"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/media">
            <Button
              variant={pathname === "/media" ? "solid" : "outline"}
              size="sm"
              className="px-3"
            >
              <Image className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip
              content={
                <span className="flex items-center gap-1">
                  <Command className="h-3.5 w-3.5" />
                  +K
                </span>
              }
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                aria-label="Command Palette"
              >
                <Command className="h-4 w-4" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center rounded-lg border border-[rgba(var(--border),0.8)] overflow-hidden">
            <Button
              variant={dark ? "subtle" : "solid"}
              size="sm"
              onClick={() => !dark && toggleDark()}
              aria-label="Enable dark mode"
              className="rounded-none"
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              variant={!dark ? "subtle" : "solid"}
              size="sm"
              onClick={() => dark && toggleDark()}
              aria-label="Enable light mode"
              className="rounded-none"
            >
              <Sun className="h-4 w-4" />
            </Button>
          </div>
          <TooltipProvider>
            <Tooltip content="Undo (⌘Z)">
              <Button
                variant="outline"
                size="sm"
                aria-label="Undo"
                onClick={undo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Redo (⇧⌘Z)">
              <Button
                variant="outline"
                size="sm"
                aria-label="Redo"
                onClick={redo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="pl-2 pr-2.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] font-medium text-[11px]">
                  AB
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={8}>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenOnboarding}>
                Onboarding
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onReset} className="text-red-600">
                Reset Workspace<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
