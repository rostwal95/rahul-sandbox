"use client";

import { Card, Tag } from "@/components/ui";
import EmptyState from "@/components/EmptyState";
import { History } from "lucide-react";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export type LogEntry = { id: string; ts: string; msg: string };

interface EventLogPanelProps {
  log: LogEntry[];
  loading?: boolean;
  className?: string;
}

function EventLogPanelComponent({
  log,
  loading,
  className,
}: EventLogPanelProps) {
  // Normalize to ensure unique keys if legacy numeric IDs collided in persisted storage
  const normalized = useMemo(() => {
    const seen = new Set<string>();
    return log.map((entry) => {
      let base = String(entry.id);
      let id = base;
      while (seen.has(id)) {
        id = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      }
      seen.add(id);
      return { ...entry, id };
    });
  }, [log]);

  // NOTE: The store prepends new log entries (newest first). For a natural
  // top-to-bottom reading order we invert here so earliest is at the top and
  // new events append visually at the bottom.
  const chronological = useMemo(() => [...normalized].reverse(), [normalized]);

  // Virtualization setup (simple fixed-height approach)
  // Threshold at which we enable simple windowing.
  const VIRTUAL_THRESHOLD = 120; // raise so short sessions never window (prevents jumpiness)
  const INITIAL_VISIBLE = 80; // show recent activity first
  const LOAD_STEP = 160; // how many to reveal per click
  const STORAGE_KEY = "kit_eventlog_visibleCount";
  const [visibleCount, setVisibleCount] = useState(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const n = raw ? parseInt(raw, 10) : NaN;
      if (Number.isFinite(n) && n > 0) return n;
    }
    return INITIAL_VISIBLE;
  });
  // Clamp visibleCount when log size changes & persist to storage
  useEffect(() => {
    setVisibleCount((c) =>
      Math.min(
        Math.max(INITIAL_VISIBLE, c),
        chronological.length || INITIAL_VISIBLE
      )
    );
  }, [chronological.length]);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(visibleCount));
    } catch {}
  }, [visibleCount]);
  const ITEM_HEIGHT = 38; // approximate row height
  const containerRef = useRef<HTMLUListElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const userScrolledUpRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      setScrollTop(el.scrollTop);
      const atBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 24;
      userScrolledUpRef.current = !atBottom; // track if user intentionally scrolled away from bottom
    };
    el.addEventListener("scroll", onScroll);
    setViewportHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setViewportHeight(el.clientHeight));
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when new events arrive unless user scrolled up
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (userScrolledUpRef.current) return; // preserve user's scroll position
    // Scroll to bottom smoothly
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [chronological.length]);

  // Determine slice of chronological list to display (recent tail by default)
  const total = chronological.length;
  const desired = Math.min(total, visibleCount);
  const sliceStart = Math.max(0, total - desired);
  const olderRemaining = sliceStart; // number of older (hidden) entries
  let baseItems = chronological.slice(sliceStart);
  let start = 0;
  let end = baseItems.length;
  if (baseItems.length > VIRTUAL_THRESHOLD) {
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT) + 6; // overscan
    start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 3);
    end = Math.min(baseItems.length, start + visibleCount);
    baseItems = baseItems.slice(start, end);
  }

  const adjustAndMaintainScroll = (next: number) => {
    const el = containerRef.current;
    const prevScrollHeight = el?.scrollHeight || 0;
    setVisibleCount(next);
    requestAnimationFrame(() => {
      if (el) {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop += newScrollHeight - prevScrollHeight;
      }
    });
  };
  const loadOlder = () => {
    if (olderRemaining === 0) return;
    adjustAndMaintainScroll(visibleCount + LOAD_STEP);
  };
  const loadAll = () => {
    if (olderRemaining === 0) return;
    adjustAndMaintainScroll(total);
  };
  const collapse = () => {
    // collapse back to initial and scroll to bottom
    setVisibleCount(INITIAL_VISIBLE);
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  return (
    <Card
      className={`p-0 flex flex-col overflow-hidden ${className || ""}`}
      role="region"
      aria-label="Event log panel"
    >
      <div className="px-5 pt-4 pb-3 border-b border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Event log</h2>
          <p className="text-xs text-muted mt-0.5 select-text">
            Latest activity & simulation events
          </p>
        </div>
        <Tag aria-live="polite">{log.length} events</Tag>
      </div>
      {(olderRemaining > 0 || visibleCount > INITIAL_VISIBLE) &&
        !loading &&
        total > 0 && (
          <div className="px-5 py-2 border-b border-subtle text-xs flex flex-wrap justify-between items-center gap-3 bg-[rgba(var(--fg),0.02)] dark:bg-[rgba(var(--fg),0.08)]">
            <span className="text-muted-2 select-text">
              Showing {desired < total ? `last ${desired}` : `all ${total}`} of{" "}
              {total}
            </span>
            <div className="flex items-center gap-2">
              {olderRemaining > 0 && (
                <button
                  type="button"
                  onClick={loadOlder}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-[rgba(var(--fg),0.06)] hover:bg-[rgba(var(--fg),0.1)] dark:bg-[rgba(var(--fg),0.18)] dark:hover:bg-[rgba(var(--fg),0.26)] transition-colors"
                  aria-label={`Load ${Math.min(
                    LOAD_STEP,
                    olderRemaining
                  )} older events ( ${olderRemaining} remaining )`}
                >
                  Load older ({olderRemaining})
                </button>
              )}
              {olderRemaining > 0 && (
                <button
                  type="button"
                  onClick={loadAll}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-[rgba(var(--accent),0.15)] hover:bg-[rgba(var(--accent),0.22)] dark:bg-[rgba(var(--accent),0.3)] dark:hover:bg-[rgba(var(--accent),0.42)] transition-colors"
                  aria-label="Load all events"
                >
                  Load all
                </button>
              )}
              {visibleCount > INITIAL_VISIBLE && (
                <button
                  type="button"
                  onClick={collapse}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-[rgba(var(--fg),0.06)] hover:bg-[rgba(var(--fg),0.1)] dark:bg-[rgba(var(--fg),0.18)] dark:hover:bg-[rgba(var(--fg),0.26)] transition-colors"
                  aria-label="Collapse back to recent events"
                >
                  Collapse
                </button>
              )}
            </div>
          </div>
        )}
      {loading ? (
        <div className="space-y-2 p-5" aria-busy>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-56" />
            </div>
          ))}
        </div>
      ) : chronological.length === 0 ? (
        <div className="p-5">
          <EmptyState
            compact
            icon={<History className="h-6 w-6" />}
            title="No events yet"
            description="When you publish, capture signups, or send mail, activity shows up here."
            className="border-dashed"
          />
        </div>
      ) : (
        <ul
          role="list"
          aria-label="Recent events"
          className="space-y-2 overflow-auto pr-4 pl-5 py-4 relative flex-1 select-text"
          ref={containerRef}
        >
          {chronological.length > VIRTUAL_THRESHOLD && (
            <div style={{ height: start * ITEM_HEIGHT }} aria-hidden />
          )}
          <AnimatePresence initial={false}>
            {baseItems.map((e, i) => {
              const globalIndex = sliceStart + start + i + 1; // position within full chronological list
              return (
                <motion.li
                  key={e.id}
                  role="listitem"
                  aria-setsize={total}
                  aria-posinset={globalIndex}
                  className="flex items-start justify-between gap-3"
                  style={{ minHeight: ITEM_HEIGHT }}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.65, 0.3, 0.9] }}
                >
                  <span
                    className="text-xs text-muted-2 shrink-0"
                    aria-label={`Event time ${e.ts}`}
                  >
                    {e.ts}
                  </span>
                  <p
                    className="text-sm leading-snug"
                    aria-label={`Event message ${e.msg}`}
                  >
                    {e.msg}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {chronological.length > VIRTUAL_THRESHOLD && (
            <div
              style={{ height: (chronological.length - end) * ITEM_HEIGHT }}
              aria-hidden
            />
          )}
        </ul>
      )}
    </Card>
  );
}

const EventLogPanel = React.memo(EventLogPanelComponent);
export default EventLogPanel;
