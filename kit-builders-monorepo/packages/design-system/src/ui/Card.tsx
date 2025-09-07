import * as React from "react";
import { cn } from "../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  variant?: "primary" | "secondary";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    title,
    subtitle,
    icon,
    ctaLabel,
    onCtaClick,
    variant = "primary",
    children,
    ...rest
  },
  ref,
) {
  const base =
    "rounded-xl border bg-white shadow-sm transition hover:shadow-md";
  const variants: Record<string, string> = {
    primary: "border-neutral-200",
    secondary: "border-neutral-200 bg-neutral-50",
  };
  return (
    <div ref={ref} className={cn(base, variants[variant], className)} {...rest}>
      {title ? (
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium tracking-tight text-neutral-900 text-sm">
              {title}
            </h3>
          </div>
          {subtitle && <p className="text-xs text-neutral-600">{subtitle}</p>}
          {ctaLabel && (
            <button
              onClick={onCtaClick}
              className="self-start text-xs font-medium text-teal-600 hover:underline"
            >
              {ctaLabel}
            </button>
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
});
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...p
}) => (
  <div
    className={cn(
      "p-4 border-b border-neutral-200 flex items-center justify-between gap-2",
      className,
    )}
    {...p}
  />
);
export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...p
}) => <div className={cn("p-4", className)} {...p} />;
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...p
}) => (
  <div className={cn("p-4 border-t border-neutral-100", className)} {...p} />
);
