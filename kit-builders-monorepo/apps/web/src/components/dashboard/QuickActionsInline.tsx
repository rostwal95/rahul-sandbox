"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/events";

export function QuickActionsInline() {
  const router = useRouter();
  const actions: {
    label: string;
    href?: string;
    onClick?: () => void;
    event: string;
  }[] = [
    { label: "New Page", href: "/page/new", event: "qa_new_page" },
    {
      label: "New Broadcast",
      href: "/broadcast/new",
      event: "qa_new_broadcast",
    },
    {
      label: "Import CSV",
      event: "qa_import_csv",
      onClick: () => alert("Open import flow (TBD)"),
    },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => {
            track(a.event);
            if (a.href) router.push(a.href);
            if (a.onClick) a.onClick();
          }}
          className="btn btn-outline text-xs"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
