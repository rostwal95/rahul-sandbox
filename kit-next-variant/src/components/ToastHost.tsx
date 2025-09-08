"use client";
import { create } from "zustand";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Toast {
  id: string;
  title: string;
  type?: "info" | "success" | "error";
  timeout?: number;
  createdAt?: number;
  priority?: number; // future expansion
}
interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => {
      const next = [
        ...s.toasts,
        { id: crypto.randomUUID(), timeout: 3000, createdAt: Date.now(), ...t },
      ];
      // Keep only the most recent 5
      return { toasts: next.slice(-5) };
    }),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<Record<string, any>>({});
  const prefersReducedMotion = (() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  })();

  // Manage timers (pause on hover)
  useEffect(() => {
    Object.values(timersRef.current).forEach((id) => clearTimeout(id));
    timersRef.current = {};
    toasts.forEach((t) => {
      if (!t.timeout) return;
      timersRef.current[t.id] = setTimeout(() => remove(t.id), t.timeout);
    });
    return () => {
      Object.values(timersRef.current).forEach((id) => clearTimeout(id));
    };
  }, [toasts, remove]);

  // Capture last focused element before first toast appears
  useEffect(() => {
    if (toasts.length === 1 && !lastFocusRef.current) {
      lastFocusRef.current = document.activeElement as HTMLElement | null;
    }
    if (toasts.length === 0 && lastFocusRef.current) {
      // restore focus after animations flush
      setTimeout(() => lastFocusRef.current?.focus(), 0);
      lastFocusRef.current = null;
    }
  }, [toasts]);

  const pause = (id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  };
  const resume = (id: string, timeout?: number) => {
    if (!timeout) return;
    timersRef.current[id] = setTimeout(() => remove(id), timeout);
  };

  return (
    <div
      className="fixed z-50 bottom-4 right-4 flex flex-col gap-2 w-[300px] outline-none"
      role="region"
      aria-label="Notifications"
      ref={regionRef}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {toasts
          .slice(-1)
          .map((t) => t.title)
          .join(" ")}
      </div>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 32,
              mass: 0.8,
            }}
            className={`group rounded-xl border p-3 text-sm shadow-sm flex items-start gap-3 bg-[rgb(var(--card))] border-[rgba(var(--border),0.8)] backdrop-blur-sm relative overflow-hidden ${
              t.type === "success"
                ? "border-green-400/60"
                : t.type === "error"
                ? "border-red-400/60"
                : ""
            }`}
            tabIndex={0}
            onMouseEnter={() => pause(t.id)}
            onMouseLeave={() => resume(t.id, t.timeout)}
            aria-label={`${t.type || "info"} notification: ${t.title}`}
          >
            <div className="flex-1 min-w-0">
              <p
                className="font-medium leading-tight text-[13px] truncate"
                title={t.title}
              >
                {t.title}
              </p>
              <div className="mt-1 h-1 w-full rounded bg-[rgba(var(--fg),0.08)] overflow-hidden">
                {t.timeout && (
                  <motion.div
                    className="h-full bg-[rgba(var(--accent),0.7)] origin-left"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{
                      duration: (t.timeout || 3000) / 1000,
                      ease: "linear",
                    }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
              </div>
            </div>
            <button
              className="text-xs text-zinc-400 hover:text-zinc-600 ml-1"
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      {/* Removed legacy shrink keyframes; handled by framer-motion */}
    </div>
  );
}

export function toast(
  title: string,
  type?: Toast["type"],
  opts?: { timeout?: number }
) {
  useToastStore
    .getState()
    .push({ title, type, timeout: opts?.timeout ?? 3000 });
}

export default ToastHost;
