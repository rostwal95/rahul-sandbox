"use client";
import * as React from "react";
// Ensure JSX namespace is picked up (some tsconfig setups with isolated modules may need this)
import type {} from "react";
// NOTE: This file implements a minimal command palette primitive.
// If legacy code imported named exports { Command, CommandGroup, ... }
// we provide a compatibility default export at the bottom.
// Dialog import kept in case future enhancement needs it (currently unused)
// import { Dialog } from "@/components/ui/Dialog";
function cn(...parts: (string | undefined | null | false)[]) {
  return parts.filter(Boolean).join(" ");
}

export function CommandRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col" role="menu">
      {children}
    </div>
  );
}
export function CommandInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <div className="border-b border-[var(--border)] px-3 py-2">
      <input
        autoFocus
        className="w-full bg-transparent outline-none text-sm placeholder:text-[var(--muted)]"
        {...props}
      />
    </div>
  );
}
export function CommandList({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-h-[340px] overflow-y-auto custom-scroll thin py-1">
      {children}
    </div>
  );
}
export function CommandGroup({
  heading,
  children,
}: {
  heading?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1">
      {heading && (
        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wide uppercase text-[var(--muted)]">
          {heading}
        </div>
      )}
      <div className="px-1 space-y-1">{children}</div>
    </div>
  );
}
export function CommandItem({
  children,
  onSelect,
  className,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left text-sm px-3 py-2 rounded-md flex items-center gap-2 hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

// Backwards compatibility: some code may expect a single Command component namespace.
// We expose a default object with the subcomponents so existing imports like
// import { Command, CommandInput } from '@/components/ui/Command' continue working.
const Command = Object.assign(CommandRoot, {
  Input: CommandInput,
  List: CommandList,
  Group: CommandGroup,
  Item: CommandItem,
});

export default Command;
