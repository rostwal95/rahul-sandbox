import * as React from "react";
// simple class merge utility (avoids bringing in clsx types if not resolved)
function cx(...parts: (string | undefined | false | null)[]) {
  return parts.filter(Boolean).join(" ");
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        "card p-5 md:p-6 hover:shadow-[var(--shadow-hover)] transition-shadow duration-200",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("mb-3 flex items-start justify-between gap-3", className)}
    >
      {children}
    </div>
  );
}
export function CardTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cx(
        "text-[var(--fs-xl)] font-semibold leading-[var(--lh-head)]",
        className,
      )}
    >
      {children}
    </h3>
  );
}
export function CardDescription({
  className,
  children,
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cx("text-[var(--fs-sm)] text-muted", className)}>
      {children}
    </p>
  );
}
export function CardContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("space-y-4", className)}>{children}</div>;
}
export function CardFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("mt-4 flex items-center justify-between gap-3", className)}
    >
      {children}
    </div>
  );
}
