// Dashboard server page (clean server component wrapper)
import AppShell from "../../components/AppShell";
import { DashboardClient } from "../../components/dashboard/DashboardClient";
import { DashboardSummary } from "../../components/dashboard/types";

export const revalidate = 60; // ISR interval for dashboard

async function fetchCombined(): Promise<{
  summary?: DashboardSummary;
  series?: Record<string, number[]>;
  meta?: any;
  error?: string;
}> {
  try {
    const started = typeof performance !== "undefined" ? performance.now() : 0;
    const port = process.env.PORT || 3000;
    const base = process.env.NEXT_PUBLIC_APP_URL || `http://127.0.0.1:${port}`;
    const res = await fetch(`${base}/api/app/dashboard/combined`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    if (started && json?.meta && !json.meta.proxy_ms) {
      json.meta.proxy_ms = Math.round(
        (typeof performance !== "undefined" ? performance.now() : started) -
          started,
      );
    }
    return json;
  } catch (e: any) {
    return { error: e.message || "Network error" };
  }
}

export default async function DashboardPage() {
  const { summary, series, meta, error } = await fetchCombined();
  const checklistArray = summary?.checklist
    ? Object.values(summary.checklist)
    : [];
  const progressPct = checklistArray.length
    ? Math.round(
        (checklistArray.filter(Boolean).length / checklistArray.length) * 100,
      )
    : 0;
  return (
    <AppShell hideTopSearch>
      <DashboardClient
        summary={summary}
        series={series}
        meta={meta}
        progressPct={progressPct}
        loadError={error || null}
      />
    </AppShell>
  );
}
