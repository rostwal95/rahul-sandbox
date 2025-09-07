"use client";
import React from "react";

// Global keyboard shortcuts handler (client component)
export function ShortcutHandler() {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return; // ignore cmd/ctrl combos for now
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;
      const nav = (path: string) => {
        window.location.href = path;
      };
      if (e.key === "g") {
        let handler: any;
        handler = (ev: KeyboardEvent) => {
          if (ev.key === "p") nav("/page");
          else if (ev.key === "b") nav("/broadcast");
          else if (ev.key === "a") nav("/audience");
          window.removeEventListener("keydown", handler, true);
        };
        window.addEventListener("keydown", handler, true);
        return;
      }
      if (e.key === "?") {
        document.dispatchEvent(new CustomEvent("open-shortcuts"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
