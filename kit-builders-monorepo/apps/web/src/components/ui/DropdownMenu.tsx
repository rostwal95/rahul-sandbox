"use client";
import * as React from "react";
import * as RadixDropdown from "@radix-ui/react-dropdown-menu";

export interface DropdownItem {
  label: string;
  onSelect?: () => void;
  href?: string;
}

export function DropdownMenu({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: DropdownItem[];
}) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content className="min-w-[180px] rounded-[var(--radius-md)] bg-[var(--card)] p-1 shadow-[var(--shadow-hover)] border border-[var(--border)] animate-in fade-in-20 zoom-in-95 duration-150">
          {items.map((i) => (
            <RadixDropdown.Item
              key={i.label}
              onSelect={(e: Event) => {
                e.preventDefault();
                if (i.href) window.open(i.href, "_blank");
                i.onSelect?.();
              }}
              className="cursor-pointer select-none rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--fs-sm)] outline-none hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] focus:bg-[color-mix(in_srgb,var(--card),var(--ink)_8%)]"
            >
              {i.label}
            </RadixDropdown.Item>
          ))}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
}
