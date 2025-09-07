import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2",
  {
    variants: {
      variant: {
        solid:
          "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400",
        outline:
          "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500",
        subtle:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600",
        ghost:
          "hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
        danger:
          "bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-400",
        primary:
          "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-600 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:active:bg-emerald-500",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5 text-base",
      },
      round: {
        true: "rounded-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      round: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  variant?: "solid" | "outline" | "subtle" | "ghost" | "danger" | "primary";
  size?: "sm" | "md" | "lg";
  round?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, round, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, round }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { buttonVariants };
