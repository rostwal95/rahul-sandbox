"use client";
import React from "react";

export type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: "info" | "success" | "error";
  ttl?: number;
};

type ToastCtx = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const Ctx = React.createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    setToasts((list) => {
      // Collapse duplicate (same message + variant within last 3 toasts)
      const recent = list.slice(-3);
      if (
        recent.some(
          (r) =>
            r.message === t.message &&
            (r.variant || "info") === (t.variant || "info"),
        )
      ) {
        return list; // skip duplicate spam
      }
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { ttl: 5000, variant: "info", ...t, id };
      const next = [...list, toast];
      // Enforce max queue length
      const MAX = 5;
      return next.length > MAX ? next.slice(next.length - MAX) : next;
    });
  }, []);

  // Manage TTL timers separately so we always dismiss latest reference
  React.useEffect(() => {
    const timers = toasts
      .map((t) => t.ttl && setTimeout(() => dismiss(t.id), t.ttl))
      .filter(Boolean) as NodeJS.Timeout[];
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, dismiss]);

  return (
    <Ctx.Provider value={{ toasts, push, dismiss }}>
      {children}
      <div className="fixed z-[60] top-4 right-4 w-80 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={toastClass(t.variant)} role="alert">
            <div className="flex justify-between gap-3">
              <div className="flex-1">
                {t.title && (
                  <div className="font-medium mb-0.5 text-sm">{t.title}</div>
                )}
                <div className="text-xs leading-relaxed whitespace-pre-line">
                  {t.message}
                </div>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-xs text-zinc-500 hover:text-zinc-800"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
};

function toastClass(variant: Toast["variant"]) {
  switch (variant) {
    case "success":
      return "rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 px-4 py-3 shadow-sm";
    case "error":
      return "rounded-lg border bg-red-50 border-red-200 text-red-700 px-4 py-3 shadow-sm";
    default:
      return "rounded-lg border bg-white border-zinc-200 text-zinc-800 px-4 py-3 shadow-sm";
  }
}
