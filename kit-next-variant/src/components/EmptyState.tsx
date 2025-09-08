import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-[rgba(var(--border),0.8)] bg-[rgba(var(--fg),0.015)]",
        compact ? "p-6 gap-3" : "p-10 gap-4",
        className
      )}
    >
      {icon && (
        <div className="text-[rgb(var(--accent))] opacity-80">{icon}</div>
      )}
      <h3 className="font-medium tracking-tight text-sm">{title}</h3>
      {description && (
        <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;
