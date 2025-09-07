"use client";
import * as React from "react";
import * as RadixProgress from "@radix-ui/react-progress";

export function Progress({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <RadixProgress.Root
      value={value}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--ink),transparent_90%)] ${className}`}
    >
      <RadixProgress.Indicator
        style={{ width: `${value}%` }}
        className="h-full bg-[var(--brand)] transition-all duration-300 ease-[var(--ease-out)]"
      />
    </RadixProgress.Root>
  );
}
