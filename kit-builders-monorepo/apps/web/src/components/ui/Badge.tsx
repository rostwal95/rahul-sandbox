import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "info" | "warn" | "danger" | "success" | "neutral";
}

const variantMap: Record<string, string> = {
  info: "bg-[var(--info)]/10 text-[var(--info)]",
  warn: "bg-[var(--warn)]/10 text-[var(--warn)]",
  danger: "bg-[var(--danger)]/10 text-[var(--danger)]",
  success: "bg-[var(--success)]/10 text-[var(--success)]",
  neutral:
    "bg-[color-mix(in_srgb,var(--ink),transparent_90%)] text-[var(--ink)]",
};

export function Badge({
  variant = "neutral",
  className = "",
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[var(--fs-sm)] font-medium ${variantMap[variant]} ${className}`}
      {...rest}
    />
  );
}
