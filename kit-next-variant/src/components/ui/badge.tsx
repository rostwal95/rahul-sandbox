import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "accent" | "success" | "danger";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide";
  const styles: Record<string, string> = {
    default: "bg-[rgba(var(--fg),0.08)] text-[rgb(var(--fg))]",
    outline:
      "border border-[rgba(var(--border),0.8)] text-[rgba(var(--fg),0.8)]",
    accent: "bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))]",
    success: "bg-green-500/15 text-green-600 dark:text-green-400",
    danger: "bg-red-500/15 text-red-600 dark:text-red-400",
  };
  return <span className={cn(base, styles[variant], className)} {...props} />;
}
