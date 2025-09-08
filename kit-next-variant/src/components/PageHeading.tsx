"use client";
import { ReactNode } from "react";

interface PageHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  actions?: ReactNode;
  divider?: boolean;
}

export function PageHeading({
  title,
  subtitle,
  className = "",
  actions,
  divider,
}: PageHeadingProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${className}`.trim()}
    >
      <div className="space-y-1 min-w-0">
        <h1 className="text-xl font-semibold tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-zinc-500 leading-relaxed max-w-prose">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="shrink-0 flex items-center gap-2">{actions}</div>
      )}
      {divider && (
        <div className="h-px w-full md:w-auto md:hidden bg-[rgba(var(--border),0.9)]" />
      )}
    </div>
  );
}

export default PageHeading;
