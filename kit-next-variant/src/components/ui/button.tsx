import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--ring),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] disabled:opacity-50 disabled:pointer-events-none active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-[rgb(var(--primary))] text-[rgb(var(--primary-fg))] shadow-sm hover:brightness-95 active:brightness-90",
        secondary:
          "bg-[rgba(var(--accent),0.12)] text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.18)]",
        outline:
          "border border-[rgba(var(--border),0.9)] bg-[rgb(var(--card))] hover:bg-[rgba(var(--fg),0.04)]",
        ghost:
          "bg-transparent hover:bg-[rgba(var(--fg),0.06)] text-[rgb(var(--fg))]",
        subtle:
          "bg-[rgba(var(--fg),0.05)] text-[rgb(var(--fg))] hover:bg-[rgba(var(--fg),0.08)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-400",
        link: "text-[rgb(var(--accent))] underline-offset-4 hover:underline px-0 h-auto",
        soft: "bg-[linear-gradient(145deg,rgba(var(--primary),0.66),rgba(var(--accent),0.66))] text-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.25)] hover:brightness-95",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant | "solid" | "danger";
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    let mapped = variant;
    if (variant === "solid") mapped = "primary" as any;
    if (variant === "danger") mapped = "destructive" as any;
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant: mapped as any, size }),
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
