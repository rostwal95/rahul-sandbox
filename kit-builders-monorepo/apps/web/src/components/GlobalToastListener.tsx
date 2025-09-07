"use client";
import React from "react";
import { useToast } from "@/components/ToastProvider";

// Listens for global CustomEvents to show toasts from non-React code paths
export function GlobalToastListener() {
  const { push } = useToast();
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail: any = (e as CustomEvent).detail || {};
      if (typeof detail.message === "string") {
        push({
          message: detail.message,
          title: detail.title,
          variant: detail.variant,
        });
      }
    };
    document.addEventListener("app-toast", handler as EventListener);
    return () =>
      document.removeEventListener("app-toast", handler as EventListener);
  }, [push]);
  return null;
}
