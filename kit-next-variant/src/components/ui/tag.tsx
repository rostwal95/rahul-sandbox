import * as React from "react";
import { cn } from "@/lib/utils";

export function Tag({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700",
        className
      )}
      {...props}
    />
  );
}
