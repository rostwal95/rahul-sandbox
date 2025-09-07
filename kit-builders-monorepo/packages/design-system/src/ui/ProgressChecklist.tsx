import * as React from "react";
import { cn } from "../utils/cn";

export type ProgressStep = { key: string; label: string; done: boolean };
export function ProgressChecklist({
  steps,
  className,
}: {
  steps: ProgressStep[];
  className?: string;
}) {
  const total = steps.length;
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / Math.max(1, total)) * 100);
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-700">
          Getting Started
        </div>
        <span className="text-xs text-neutral-500">
          {done}/{total}
        </span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-neutral-900 transition-all"
          style={{ width: pct + "%" }}
        />
      </div>
      <ul className="space-y-2 text-sm">
        {steps.map((s) => (
          <li
            key={s.key}
            className={cn(
              "flex items-center gap-2",
              s.done ? "text-neutral-800" : "text-neutral-500",
            )}
          >
            <span
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                s.done
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-300",
              )}
            >
              {s.done && <span className="text-[10px]">✓</span>}
            </span>
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
