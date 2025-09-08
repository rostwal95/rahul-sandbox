import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200",
          className
        )}
        {...props}
      />
    );
  }
);
