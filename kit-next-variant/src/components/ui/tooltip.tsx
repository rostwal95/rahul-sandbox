"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

TooltipPrimitive.Provider.displayName = "TooltipProvider";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({
  children,
  content,
  align = "center",
  side = "top",
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  align?: TooltipPrimitive.TooltipContentProps["align"];
  side?: TooltipPrimitive.TooltipContentProps["side"];
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          className={cn(
            "z-[var(--z-toaster)] rounded-md border border-[rgba(var(--border),0.9)] bg-[rgb(var(--card))] px-2 py-1 text-xs shadow-soft will-change-[transform,opacity] data-[state=delayed-open]:animate-in data-[state=closed]:animate-out"
          )}
        >
          {" "}
          {content}{" "}
          <TooltipPrimitive.Arrow className="fill-[rgb(var(--card))]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
