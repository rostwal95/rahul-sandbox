import * as React from "react";
import { cn } from "../utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  bleed?: boolean;
}

/**
 * Responsive content width wrapper enforcing consistent horizontal rhythm.
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ className, size = "lg", bleed = false, ...rest }, ref) {
    const maxWidths: Record<string, string> = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-[1100px]",
      full: "max-w-none",
    };
    return (
      <div
        ref={ref}
        className={cn(
          bleed ? "w-full" : "mx-auto w-full",
          maxWidths[size],
          "px-4 md:px-6 lg:px-8",
          className,
        )}
        {...rest}
      />
    );
  },
);
Container.displayName = "Container";
