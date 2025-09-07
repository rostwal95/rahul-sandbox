"use client";
import * as React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

export interface TabsProps {
  tabs: { value: string; label: string; content: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ tabs, defaultValue, className }: TabsProps) {
  const first = tabs[0]?.value;
  return (
    <RadixTabs.Root
      defaultValue={defaultValue || first}
      className={`flex flex-col gap-4 ${className || ""}`}
    >
      <RadixTabs.List className="flex gap-2 border-b border-[var(--border)]">
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            className="relative px-3 py-2 text-[var(--fs-sm)] font-medium rounded-t-md data-[state=active]:text-[var(--ink)] text-[var(--muted)] outline-none data-[state=active]:bg-[var(--card)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--ink)]/12"
          >
            {t.label}
            <span className="pointer-events-none absolute left-0 right-0 -bottom-px h-[2px] bg-transparent data-[state=active]:bg-[var(--brand)]" />
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((t) => (
        <RadixTabs.Content
          key={t.value}
          value={t.value}
          className="animate-in fade-in-20 duration-150"
        >
          {t.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
