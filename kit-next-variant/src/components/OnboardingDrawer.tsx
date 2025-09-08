"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const tasks = [
  { href: "/broadcast", label: "Send your first email" },
  { href: "/sequence", label: "Start a newsletter sequence" },
  { href: "/page", label: "Publish a landing page" },
];

export default function OnboardingDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[420px] bg-white shadow-xl border-l border-[var(--border)] p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Get started publishing</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Complete these steps to activate your account.
        </p>
        <div className="space-y-4">
          {tasks.map((t) => (
            <Card
              key={t.href}
              className="p-4 flex items-center justify-between"
            >
              <span>{t.label}</span>
              <Link href={t.href}>
                <Button variant="outline">Do it</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
