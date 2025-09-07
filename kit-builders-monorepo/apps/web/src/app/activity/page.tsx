"use client";
import useSWR from "swr";
import Link from "next/link";

type EventItem = {
  id: string;
  type?: string;
  name?: string;
  title?: string;
  created_at?: string;
  at?: string;
};
const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function ActivityPage() {
  const { data, error, isLoading } = useSWR<EventItem[] | any>(
    "/api/app/events",
    fetcher,
  );
  const items: EventItem[] = Array.isArray(data) ? data : [];
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
          Back
        </Link>
      </header>
      {error && (
        <div className="text-sm text-red-600">Failed to load events.</div>
      )}
      {isLoading && !items.length && <SkeletonList />}
      {!isLoading && !items.length && !error && (
        <div className="text-sm text-muted">No activity yet.</div>
      )}
      <ul className="space-y-2">
        {items.map((ev) => (
          <EventRow key={ev.id} ev={ev} />
        ))}
      </ul>
    </main>
  );
}

function EventRow({ ev }: { ev: EventItem }) {
  const t = ev.type || ev.name || "event";
  const title = ev.title || ev.name || ev.type || ev.id;
  const when = ev.at || ev.created_at;
  return (
    <li className="group flex items-center gap-3 rounded-lg border bg-white p-3 hover:shadow-sm transition">
      <div className="size-8 rounded-md bg-zinc-900 text-white inline-flex items-center justify-center text-[11px] font-medium">
        {t.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {when && (
          <div className="text-[11px] text-muted">
            {new Date(when).toLocaleString()}
          </div>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 text-[10px] text-primary font-medium">
        Open
      </div>
    </li>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 rounded-md bg-zinc-200/60 animate-pulse" />
      ))}
    </div>
  );
}
