"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  side?: "right" | "left";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          className={cn(
            "fixed top-0 h-full w-[420px] bg-white shadow-xl border-l border-[var(--border)] p-6 overflow-y-auto data-[state=open]:animate-slideIn",
            side === "left" ? "left-0 border-l-0 border-r" : "right-0"
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && (
                <Dialog.Title className="text-lg font-semibold">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-zinc-500 mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 hover:bg-zinc-100"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
