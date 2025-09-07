"use client";
import * as React from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { X } from "lucide-react";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixToast.Provider swipeDirection="right" duration={4000}>
      {children}
      <RadixToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)] z-50 outline-none" />
    </RadixToast.Provider>
  );
}

export function useToast() {
  const [items, set] = React.useState<React.ReactNode[]>([]);
  const push = React.useCallback(
    (node: React.ReactNode) => set((p) => [...p, node]),
    [],
  );
  return { push, items };
}

export function Toast({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose?: () => void;
}) {
  return (
    <RadixToast.Root className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-start rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-hover)] animate-in fade-in-20 slide-in-from-bottom-2 duration-200">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-[var(--brand)]" />
      <div className="space-y-1 pr-4">
        <div className="text-sm font-medium leading-[var(--lh-head)]">
          {title}
        </div>
        {description && (
          <div className="text-[var(--fs-sm)] text-[var(--muted)]">
            {description}
          </div>
        )}
      </div>
      <RadixToast.Close
        className="rounded-md p-1 hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/12"
        aria-label="Close"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </RadixToast.Close>
    </RadixToast.Root>
  );
}
