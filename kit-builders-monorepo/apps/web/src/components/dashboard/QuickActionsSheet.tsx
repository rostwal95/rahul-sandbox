"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/events";
export function QuickActionsSheet() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) track("quick_action_started", { source: "dashboard" });
      }}
    >
      <Dialog.Trigger asChild>
        <button className="btn btn-outline">Quick Actions</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 md:left-auto md:right-4 md:bottom-4 md:w-96 rounded-t-2xl md:rounded-xl bg-white p-4 shadow-md border focus:outline-none">
          <Dialog.Title className="text-sm font-medium mb-2">
            Create Something
          </Dialog.Title>
          <div className="space-y-2 text-sm">
            <ActionBtn
              label="Create Page"
              onClick={() => {
                track("quick_action_completed", { action: "create_page" });
                setOpen(false);
                router.push("/page/new");
              }}
            />
            <ActionBtn
              label="Create Broadcast"
              onClick={() => {
                track("quick_action_completed", { action: "create_broadcast" });
                setOpen(false);
                router.push("/broadcast/new");
              }}
            />
            <ActionBtn
              label="Import CSV"
              onClick={() =>
                track("quick_action_completed", { action: "import_csv" })
              }
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Dialog.Close className="text-xs text-muted hover:text-ink">
              Close
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg border bg-zinc-50 hover:bg-white text-xs font-medium"
    >
      {label}
    </button>
  );
}
