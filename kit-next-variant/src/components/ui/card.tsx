import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "card backdrop-saturate-125 shadow-soft relative",
        // subtle hover luminance
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity",
        "before:bg-[radial-gradient(circle_at_30%_15%,rgba(var(--accent),0.14),transparent_65%)] hover:before:opacity-100",
        className
      )}
      {...props}
    />
  );
}
