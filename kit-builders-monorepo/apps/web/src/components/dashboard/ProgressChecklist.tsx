"use client";
import {
  Loader2,
  LayoutTemplate,
  Mail,
  Rocket,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { track } from "@/lib/events";

type Checklist =
  | { profile: boolean; page: boolean; email: boolean; publish: boolean }
  | undefined;
export function ProgressChecklist({
  checklist,
  loading,
}: {
  checklist: Checklist;
  loading: boolean;
}) {
  const steps: {
    key: keyof NonNullable<Checklist>;
    label: string;
    icon: any;
    href: string;
  }[] = [
    {
      key: "profile",
      label: "Profile",
      icon: Users,
      href: "/settings/profile",
    },
    {
      key: "page",
      label: "Create Page",
      icon: LayoutTemplate,
      href: "/page/new",
    },
    { key: "email", label: "Create Email", icon: Mail, href: "/broadcast/new" },
    { key: "publish", label: "Publish", icon: Rocket, href: "/page" },
  ];
  const doneCount = steps.filter((s) => checklist?.[s.key]).length;
  const pct = (doneCount / steps.length) * 100;
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">Getting Started</div>
        <div className="text-xs text-muted">
          {doneCount}/{steps.length} • {Math.round(pct)}%
        </div>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Onboarding checklist"
      >
        {steps.map((s) => {
          const done = checklist?.[s.key];
          return (
            <Link
              role="tab"
              aria-selected={done}
              key={s.key}
              onClick={() => track("checklist_step_clicked", { step: s.key })}
              href={s.href}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border motion-safe:transition-[background-color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${done ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-white"}`}
            >
              {loading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <s.icon className="size-3" />
              )}
              <span>{s.label}</span>
              {done && <Sparkles className="size-3 text-emerald-500" />}
            </Link>
          );
        })}
        <div className="flex-1" />
        <Link
          href={steps.find((s) => !checklist?.[s.key])?.href || "/dashboard"}
          className="ml-auto text-xs text-primary font-medium hover:underline self-center"
        >
          {doneCount === steps.length ? "Review" : "Resume"}
        </Link>
      </div>
      <motion.div
        className="h-1 mt-4 rounded bg-zinc-100 overflow-hidden"
        aria-hidden
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="h-full bg-emerald-500"
        />
      </motion.div>
    </div>
  );
}

// Compact horizontal progress variant for dashboard header area
export function OnboardingProgress({
  checklist,
  loading,
  progressPct,
}: {
  checklist: Checklist;
  loading: boolean;
  progressPct: number;
}) {
  const steps: {
    key: keyof NonNullable<Checklist>;
    label: string;
    href: string;
  }[] = [
    { key: "profile", label: "Profile", href: "/settings/profile" },
    { key: "page", label: "Page", href: "/page/new" },
    { key: "email", label: "Email", href: "/broadcast/new" },
    { key: "publish", label: "Publish", href: "/page" },
  ];
  return (
    <div
      className="flex items-center gap-4 py-2 px-3 rounded-lg border border-[var(--border)] bg-[var(--card)]/70 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/60 animate-in fade-in-20 duration-200"
      role="group"
      aria-label="Onboarding progress"
    >
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Getting Started
        </span>
        <span className="text-[11px] tabular-nums text-[var(--muted)]">
          {progressPct}%
        </span>
      </div>
      <div className="relative flex-1 h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-700/60 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] transition-[width] duration-500"
          style={{ width: `${progressPct}%` }}
          aria-hidden
        />
        {/* Step markers */}
        {steps.map((s, i) => {
          const done = checklist?.[s.key];
          const left = (i / (steps.length - 1)) * 100;
          return (
            <a
              key={s.key}
              href={s.href}
              onClick={() => track("checklist_step_clicked", { step: s.key })}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              style={{ left: `${left}%` }}
              aria-label={`${s.label} ${done ? "completed" : "incomplete"}`}
            >
              <span
                className={
                  "size-2 rounded-full transition-colors " +
                  (done
                    ? "bg-emerald-500 group-hover:bg-emerald-400"
                    : "bg-zinc-300 dark:bg-zinc-600 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-500")
                }
              />
            </a>
          );
        })}
      </div>
      <div className="hidden md:flex items-center gap-2">
        {steps.map((s) => {
          const done = checklist?.[s.key];
          return (
            <a
              key={s.key}
              href={s.href}
              className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${done ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"}`}
            >
              {s.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
