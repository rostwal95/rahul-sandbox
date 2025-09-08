"use client";

import { Card, Tag } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function GoalsPanelComponent({
  goals,
  loading,
}: {
  goals: { published: boolean; signups: number; emailSent: boolean };
  loading?: boolean;
}) {
  const items = [
    {
      id: "publish",
      label: "Publish your first landing page",
      done: goals.published,
      progress: goals.published ? 1 : 0,
      total: 1,
    },
    {
      id: "signups",
      label: "Capture 3 signups",
      done: goals.signups >= 3,
      progress: Math.min(3, goals.signups),
      total: 3,
    },
    {
      id: "broadcast",
      label: "Send a broadcast",
      done: goals.emailSent,
      progress: goals.emailSent ? 1 : 0,
      total: 1,
    },
  ];
  if (loading) {
    return (
      <Card
        className="p-5"
        role="region"
        aria-label="Onboarding goals loading"
        aria-busy
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <ul className="space-y-3" role="list">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[rgb(var(--card))] dark:bg-[rgba(var(--card),0.95)] p-3 shadow-soft/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full" />
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  return (
    <Card className="p-5" role="region" aria-label="Onboarding goals">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Goals
        </h2>
        <Tag aria-live="polite">
          {items.filter((i) => i.done).length}/3 completed
        </Tag>
      </div>
      <ul className="space-y-3" role="list" aria-label="Goal progress list">
        <AnimatePresence initial={false}>
          {items.map((g) => (
            <motion.li
              key={g.id}
              role="listitem"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 0.65, 0.3, 0.9] }}
              className="rounded-xl border border-[var(--border)] bg-[rgba(var(--card),0.98)] dark:bg-[rgba(var(--card),0.98)] p-3 shadow-soft/30"
              aria-label={`${g.label} ${g.progress} of ${g.total} complete`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{g.label}</p>
                <Tag>
                  {g.progress}/{g.total}
                </Tag>
              </div>
              <div
                className="mt-2 h-2 w-full rounded bg-[rgba(var(--fg),0.08)] dark:bg-[rgba(var(--fg),0.25)] overflow-hidden"
                aria-hidden
              >
                <motion.div
                  className="h-2 rounded progress-bar-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${(g.progress / g.total) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 0.65, 0.3, 0.9] }}
                />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

export default React.memo(GoalsPanelComponent);
