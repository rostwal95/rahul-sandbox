import * as React from "react";
import { motion } from "framer-motion";
import Sparkline from "./Sparkline";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  pct?: string;
  trend?: number[];
  accent?: "primary" | "accent" | "neutral";
  loading?: boolean;
}

function MetricCardBase({
  label,
  value,
  helper,
  pct,
  trend,
  accent = "primary",
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[rgba(var(--border),0.85)] bg-[rgb(var(--card))] p-4 flex flex-col",
          "animate-pulse"
        )}
        aria-busy="true"
        aria-label={`${label} loading`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-20 rounded bg-[rgba(var(--fg),0.08)]" />
          <div className="h-3 w-10 rounded bg-[rgba(var(--fg),0.08)]" />
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-2">
            <div className="h-7 w-16 rounded bg-[rgba(var(--fg),0.1)]" />
            {helper && (
              <div className="h-3 w-32 rounded bg-[rgba(var(--fg),0.08)]" />
            )}
          </div>
          <div className="h-12 w-32 rounded bg-[rgba(var(--fg),0.06)]" />
        </div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 0.65, 0.3, 0.9] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--card))] dark:bg-[rgba(var(--card),0.98)] p-4 flex flex-col shadow-soft/40",
        "before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:rounded-[inherit]",
        accent === "primary" &&
          "before:bg-[radial-gradient(circle_at_30%_10%,rgba(var(--primary),0.18),transparent_65%)]",
        accent === "accent" &&
          "before:bg-[radial-gradient(circle_at_70%_15%,rgba(var(--accent),0.2),transparent_65%)]",
        accent === "neutral" &&
          "before:bg-[radial-gradient(circle_at_50%_0%,rgba(var(--fg),0.08),transparent_70%)]",
        "hover:before:opacity-100"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wide text-[rgba(var(--muted),0.9)] font-medium">
          {label}
        </p>
        {pct && (
          <span className="text-[10px] font-medium rounded-md bg-[rgba(var(--fg),0.07)] px-1.5 py-0.5 text-[rgba(var(--fg),0.7)]">
            {pct}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-2xl font-semibold leading-none tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {helper && (
            <p className="mt-1 text-[11px] text-[rgba(var(--muted),0.9)]">
              {helper}
            </p>
          )}
        </div>
        {trend && (
          <div className="h-12 w-32 ml-auto opacity-80 group-hover:opacity-100 transition-opacity">
            <Sparkline data={trend} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const MetricCard = React.memo(MetricCardBase);

MetricCard.displayName = "MetricCard";
