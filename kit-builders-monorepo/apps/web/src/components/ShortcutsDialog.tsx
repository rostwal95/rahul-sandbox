"use client";
import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const SHORTCUTS: { group: string; items: { keys: string; desc: string }[] }[] =
  [
    {
      group: "Navigation",
      items: [
        { keys: "g p", desc: "Go to Pages" },
        { keys: "g b", desc: "Go to Broadcasts" },
        { keys: "g a", desc: "Go to Audience" },
      ],
    },
    {
      group: "General",
      items: [{ keys: "?", desc: "Open this help" }],
    },
  ];

export function ShortcutsDialog() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("open-shortcuts", handler as EventListener);
    return () =>
      document.removeEventListener("open-shortcuts", handler as EventListener);
  }, []);
  React.useEffect(() => {
    if (open) {
      document.documentElement.classList.add("modal-open");
    } else {
      document.documentElement.classList.remove("modal-open");
    }
  }, [open]);
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-in fade-in-20 data-[state=closed]:fade-out-20" />
        <RadixDialog.Content className="fixed z-[80] left-1/2 top-1/2 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] bg-[var(--card)] p-6 shadow-[var(--shadow-hover)] animate-in zoom-in-95 fade-in-20 duration-200 border border-[var(--border)] focus:outline-none">
          <div className="flex items-start justify-between mb-4">
            <RadixDialog.Title className="text-[var(--fs-xl)] font-semibold leading-[var(--lh-head)]">
              Keyboard Shortcuts
            </RadixDialog.Title>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_6%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/12"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-6">
            {SHORTCUTS.map((group) => (
              <div key={group.group}>
                <div className="text-[var(--fs-xs)] uppercase font-medium tracking-wide text-[var(--muted)] mb-2">
                  {group.group}
                </div>
                <ul className="space-y-2">
                  {group.items.map((i) => (
                    <li
                      key={i.keys}
                      className="flex items-center justify-between gap-4 text-[var(--fs-sm)]"
                    >
                      <div className="text-[var(--ink)]">{i.desc}</div>
                      <div className="flex items-center gap-1">
                        {i.keys.split(" ").map((k, idx) => (
                          <kbd
                            key={idx}
                            className="min-w-6 px-1.5 py-1 text-[11px] rounded-md border border-[var(--border)] bg-[var(--bg-alt)] text-[var(--ink)] shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
