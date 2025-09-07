"use client";
import Link from "next/link";
import { FileText, Mail, BarChart3 } from "lucide-react";

type Item = { type: string; title: string; id: string; at: string };
export function ActivityList({
  items,
  loading,
}: {
  items: Item[] | undefined;
  loading: boolean;
}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">Recent Activity</div>
        <Link href="/activity" className="text-xs text-muted hover:text-ink">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {loading &&
          !items?.length &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-md bg-zinc-200/60 animate-pulse"
            />
          ))}
        {!loading && (!items || items.length === 0) && (
          <div className="text-xs text-muted">
            No activity yet — create your first page.
          </div>
        )}
        {items?.map((it) => (
          <ActivityRow key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}
function ActivityRow({ item }: { item: Item }) {
  const Icon =
    item.type === "page"
      ? FileText
      : item.type === "broadcast"
        ? Mail
        : BarChart3;
  return (
    <Link
      href={`/${item.type}/${item.id}`}
      className="group flex items-center gap-3 rounded-lg p-2 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition"
    >
      <div className="size-7 rounded-md bg-zinc-900 text-white inline-flex items-center justify-center text-[11px] font-medium">
        <Icon className="size-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate tracking-tight">
          {item.title}
        </div>
        <div className="text-[10px] text-muted">
          {new Date(item.at).toLocaleString()}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition text-[10px] text-primary font-medium">
        Open
      </div>
    </Link>
  );
}
