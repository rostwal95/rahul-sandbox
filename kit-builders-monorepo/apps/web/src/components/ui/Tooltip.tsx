"use client";
import * as React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

export function Tooltip({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <RadixTooltip.Provider delayDuration={250}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="rounded-[var(--radius-sm)] bg-[var(--ink)] text-white text-[11px] px-2 py-1 shadow-[var(--shadow-hover)] animate-in fade-in-20 duration-200 ease-[var(--ease-out)]"
            sideOffset={6}
          >
            {content}
            <RadixTooltip.Arrow className="fill-[var(--ink)]" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
