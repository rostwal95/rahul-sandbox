"use client";
import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuPortal = DropdownPrimitive.Portal;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: DropdownPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "min-w-[200px] rounded-lg border border-[rgba(var(--border),0.9)] bg-[rgb(var(--card))] p-1",
          "shadow-strong focus:outline-none",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}


export function DropdownMenuItem({
  className,
  inset,
  ...props
}: DropdownPrimitive.DropdownMenuItemProps & { inset?: boolean }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-[rgba(var(--accent),0.08)]",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownPrimitive.DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-[rgba(var(--border),0.85)]", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownPrimitive.DropdownMenuLabelProps
>(({ className, inset, ...props }: any, ref) => (
  <DropdownPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-xs font-medium text-muted",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-[10px] tracking-wider opacity-60", className)}
      {...props}
    />
  );
};
