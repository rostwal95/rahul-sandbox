import * as React from "react";
import { cn } from "../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: "sm" | "md" | "lg" | "full";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  radius = "md",
  ...rest
}) => {
  const radii: Record<string, string> = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };
  return (
    <div
      className={cn(
        "skeleton bg-neutral-200 dark:bg-neutral-700 animate-pulse",
        radii[radius],
        className,
      )}
      {...rest}
    />
  );
};
