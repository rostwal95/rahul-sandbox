import * as React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[color-mix(in_srgb,var(--ink),transparent_90%)] ${className}`}
    />
  );
}
