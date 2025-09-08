"use client";

// Legacy combined UI exports (maintained for incremental migration).
import { cn } from "@/lib/utils";
import { HTMLAttributes, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
export { Button as ShadButton, buttonVariants } from "./ui/button";
export { Card as ShadCard } from "./ui/card";
export { Input as ShadInput } from "./ui/input";
export { Tag as ShadTag } from "./ui/tag";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("card p-4", className)} {...rest} />;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        solid: "bg-[var(--color-brand)] text-white hover:opacity-90",
        outline:
          "border border-[rgba(var(--border),0.9)] bg-[rgb(var(--card))] hover:bg-[rgba(var(--fg),0.04)]",
        subtle: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "py-2",
        lg: "px-5 py-3 text-base",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export function Input(props: any) {
  const { className, ...rest } = props;
  return <input className={cn("input", className)} {...rest} />;
}

export function Tag({ children, className = "" }: any) {
  return <span className={cn("tag", className)}>{children}</span>;
}
