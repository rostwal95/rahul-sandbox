"use client";
import * as React from "react";
import { cn } from "@kit/design-system/utils/cn";

export interface SubscribeProps {
  headline?: string;
  sub?: string;
  placeholder?: string;
  consent?: string;
  cta?: { text: string; href?: string };
  subdued?: boolean;
}

export function Subscribe({
  headline = "Stay in the loop",
  sub = "Get product updates and insights.",
  placeholder = "you@example.com",
  consent = "We respect your privacy.",
  cta = { text: "Subscribe" },
  subdued,
}: SubscribeProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-10 text-center flex flex-col gap-6",
        subdued && "bg-zinc-50",
      )}
    >
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight">{headline}</h2>
        {sub && <p className="text-zinc-600 max-w-md mx-auto text-sm">{sub}</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // integration placeholder
        }}
        className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto"
      >
        <input
          type="email"
          required
          placeholder={placeholder}
          className="input flex-1"
        />
        <button type="submit" className="btn btn-solid">
          {cta.text}
        </button>
      </form>
      {consent && (
        <div className="text-xs text-zinc-500 max-w-md mx-auto">{consent}</div>
      )}
    </section>
  );
}
