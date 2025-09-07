"use client";
import * as React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";

export function HoverCard({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <RadixHoverCard.Root openDelay={160} closeDelay={120}>
      <RadixHoverCard.Trigger asChild>{trigger}</RadixHoverCard.Trigger>
      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          sideOffset={10}
          collisionPadding={12}
          align="end"
          className="hovercard-content z-[60] rounded-[var(--radius-md)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg),var(--ink)_4%)]/85 backdrop-blur-sm p-3 shadow-[var(--shadow-hover)] w-64 text-[var(--fs-sm)] text-[var(--ink)] data-[state=open]:animate-tooltip-in data-[state=closed]:animate-tooltip-out will-change-transform"
        >
          {children}
          <RadixHoverCard.Arrow
            className="fill-[var(--card)] dark:fill-[var(--bg)] drop-shadow"
            width={14}
            height={8}
          />
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
}
