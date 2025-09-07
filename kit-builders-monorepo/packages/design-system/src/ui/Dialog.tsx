import * as React from "react";
import * as RD from "@radix-ui/react-dialog";
import { cn } from "../utils/cn";
export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;
export const DialogPortal = RD.Portal;
export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RD.Overlay>
>(function Overlay({ className, ...p }, ref) {
  return (
    <RD.Overlay
      ref={ref}
      className={cn("fixed inset-0 bg-black/30 backdrop-blur-sm", className)}
      {...p}
    />
  );
});
export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RD.Content>
>(function Content({ className, children, ...p }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RD.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-lg focus:outline-none",
          className,
        )}
        {...p}
      >
        {children}
      </RD.Content>
    </DialogPortal>
  );
});
export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...p
}) => <div className={cn("mb-4 space-y-1", className)} {...p} />;
export const DialogTitle = RD.Title;
export const DialogDescription = RD.Description;
export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...p
}) => <div className={cn("mt-6 flex justify-end gap-2", className)} {...p} />;
