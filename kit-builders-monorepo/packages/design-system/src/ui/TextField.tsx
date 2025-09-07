import * as React from "react";
import { cn } from "../utils/cn";
export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TF({ label, error, className, id, ...p }, ref) {
    const inputId = id || React.useId();
    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-neutral-600"
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-9 w-full rounded-lg border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/10",
            error ? "border-red-500" : "border-neutral-300",
            className,
          )}
          {...p}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
