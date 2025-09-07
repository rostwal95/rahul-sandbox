"use client";
import { useEffect } from "react";
import { sendRUM } from "@/lib/rum";

export default function RUMClient({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      sendRUM({
        kind: "page_view",
        slug,
        t: Date.now(),
        perf: (performance as any)?.timing,
      });
      const v = (document.querySelector("[data-hero-variant]") as HTMLElement)
        ?.dataset?.heroVariant;
      if (v) {
        sendRUM({
          kind: "ab_assign",
          key: "hero",
          slug,
          variant: v,
          t: Date.now(),
        });
      }
    } catch {}
  }, [slug]);
  return null;
}
