"use client";
import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export interface DialogProps {
  title?: string;
  description?: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dialog({ title, description, trigger, children }: DialogProps) {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in-20 duration-200" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[min(480px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] bg-[var(--card)] p-6 shadow-[var(--shadow-hover)] animate-in zoom-in-95 fade-in-20 duration-200">
          <div className="flex items-start justify-between gap-4 mb-4">
            {title && (
              <RadixDialog.Title className="text-[var(--fs-xl)] font-semibold leading-[var(--lh-head)]">
                {title}
              </RadixDialog.Title>
            )}
            <RadixDialog.Close className="rounded-md p-1 hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/12">
              <X className="h-4 w-4" />
            </RadixDialog.Close>
          </div>
          {description && (
            <RadixDialog.Description className="text-[var(--fs-sm)] text-muted mb-4">
              {description}
            </RadixDialog.Description>
          )}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
