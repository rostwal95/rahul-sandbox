"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

const variants = {
  primary: "bg-[var(--brand)] text-white hover:brightness-95",
  secondary:
    "bg-[var(--card)] border border-[var(--border)] hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_4%)]",
  ghost: "hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)]",
  destructive: "bg-[var(--danger)] text-white hover:brightness-95",
};

const sizes = {
  md: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-[var(--fs-sm)]",
  lg: "h-11 px-5 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      asChild,
      className = "",
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      ...rest
    },
    ref,
  ) {
    const Comp: any = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/12 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
        )}
        {children}
      </Comp>
    );
  },
);
