import * as React from "react";
import { cn } from "../utils/cn";

export interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "warn";
  className?: string;
}
export function StatCard({
  label,
  value,
  delta,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm",
        tone === "warn" && "border-amber-300",
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium",
              delta.startsWith("-") ? "text-red-600" : "text-emerald-600",
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
