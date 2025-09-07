"use client";
import { HoverCard } from "@/components/ui/HoverCard";
export function StatCard({
  label,
  value,
  loading,
  description,
  idx,
}: {
  label: string;
  value: string | undefined;
  loading: boolean;
  description?: string;
  idx?: number; // for staggered animation
}) {
  const body = (
    <div
      className="card p-4 flex flex-col gap-1 opacity-0 animate-in fade-in-20 slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${(idx || 0) * 50}ms` }}
      aria-busy={loading}
      aria-live="polite"
    >
      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 flex items-center gap-1">
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums">
        {loading ? (
          <span className="inline-block h-6 w-14 bg-zinc-200/70 rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
    </div>
  );
  return description ? (
    <HoverCard trigger={body}>{description}</HoverCard>
  ) : (
    body
  );
}
