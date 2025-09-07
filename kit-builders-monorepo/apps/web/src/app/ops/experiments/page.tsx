"use client";
import useSWR from "swr";
import { SafeList } from "@/components/SafeList";
const fetcher = (u: string) => fetch(u).then((r) => r.json());
export default function ExperimentsOverview() {
  const { data } = useSWR("/api/app/experiments", fetcher, {
    refreshInterval: 5000,
  });
  return (
    <main className="mx-auto max-w-[900px] p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Experiments Overview</h1>
      <SafeList
        className="grid gap-2"
        items={data}
        loading={data === undefined}
        error={undefined}
        unexpectedLabel="Unexpected experiments shape"
        empty={<div className="text-sm text-zinc-500">No experiments</div>}
        keyFn={(e: any) => e.key + (e.slug || "")}
        render={(e: any) => (
          <a
            href={`/ops/experiments/${e.key}${e.slug ? `?slug=${e.slug}` : ""}`}
            className={`border rounded-xl p-3 hover:bg-zinc-50 ${e.enabled ? "" : "opacity-70"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {e.key}{" "}
                  {e.slug && (
                    <span className="text-xs text-zinc-500">· {e.slug}</span>
                  )}
                </div>
                {e.guardrail_note && (
                  <div className="text-xs text-amber-700">
                    ⚠ {e.guardrail_note}
                  </div>
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {e.enabled ? "enabled" : "paused"} · updated{" "}
                {new Date(e.updated_at).toLocaleString()}
              </div>
            </div>
          </a>
        )}
      />
    </main>
  );
}
