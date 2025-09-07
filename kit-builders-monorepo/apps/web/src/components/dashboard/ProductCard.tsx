"use client";
import Link from "next/link";
import { track } from "@/lib/events";
import { motion } from "framer-motion";
export function ProductCard({
  title,
  icon: Icon,
  cta,
  href,
  idx,
  meta,
}: {
  title: string;
  icon: any;
  cta: string;
  href: string;
  idx?: number; // for staggered animation
  meta?: string; // right aligned meta summary
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: (idx || 0) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="card group p-5 flex flex-col gap-4 relative motion-safe:transition-[box-shadow,transform] cursor-pointer focus-within:ring-2 focus-within:ring-black/10 ring-offset-2 ring-offset-[var(--card)]"
    >
      <Link
        href={href}
        aria-label={`Open ${title}`}
        onClick={() => track("tile_opened", { tile: title })}
        className="absolute inset-0 rounded-[inherit] z-10"
      />
      <div className="inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white size-9 shadow ring-1 ring-black/5">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium tracking-tight text-[var(--ink)]">
            {title}
          </div>
          {meta && (
            <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]/70">
              {meta}
            </div>
          )}
        </div>
        <div className="text-xs text-muted pr-4">
          Work on your {title.toLowerCase()}
        </div>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-2">
        <span className="relative z-20 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted)] group-hover:text-[var(--ink)] transition-colors">
          {cta} →
        </span>
        <Link
          href={`/docs/${title.toLowerCase().replace(/ /g, "-")}`}
          className="relative z-20 text-xs text-muted hover:text-ink"
          onClick={(e) => e.stopPropagation()}
        >
          Docs
        </Link>
      </div>
    </motion.div>
  );
}
