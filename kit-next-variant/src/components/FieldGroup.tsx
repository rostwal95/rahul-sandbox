import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldGroupProps {
  label?: ReactNode;
  hint?: ReactNode;
  inline?: boolean;
  children: ReactNode;
  className?: string;
  requiredMark?: boolean;
}

export function FieldGroup({
  label,
  hint,
  inline,
  children,
  className = "",
  requiredMark,
}: FieldGroupProps) {
  return (
    <div
      className={cn("space-y-1", inline && "flex items-start gap-4", className)}
    >
      {label && (
        <div
          className={cn(
            "text-xs font-medium text-zinc-600 flex items-center gap-1",
            inline && "min-w-[140px] pt-1"
          )}
        >
          <span>{label}</span>
          {requiredMark && <span className="text-red-500">*</span>}
        </div>
      )}
      <div className={cn("space-y-1 w-full", inline && "flex-1")}>
        {children}
      </div>
      {hint && (
        <p className="text-[11px] text-zinc-500 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}

export default FieldGroup;
