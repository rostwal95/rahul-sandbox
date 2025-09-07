"use client";
import useSWR from "swr";
import { apiBase } from "@/lib/apiBase";
const fetcher = (u: string) => fetch(u).then((r) => r.json());
export default function Queues() {
  const { data } = useSWR("/api/app/ops/sidekiq_stats", fetcher, {
    refreshInterval: 5000,
  });
  return (
    <main className="mx-auto max-w-[900px] p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Queues</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-medium">Processed</div>
          <div className="text-2xl">{data?.processed ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Failed</div>
          <div className="text-2xl">{data?.failed ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Enqueued</div>
          <div className="text-2xl">{data?.enqueued ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Scheduled</div>
          <div className="text-2xl">{data?.scheduled_size ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Retries</div>
          <div className="text-2xl">{data?.retry_size ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Dead</div>
          <div className="text-2xl">{data?.dead_size ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Processes</div>
          <div className="text-2xl">{data?.processes_size ?? "—"}</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Default latency</div>
          <div className="text-2xl">
            {data?.default_queue_latency?.toFixed?.(2) ?? "—"}s
          </div>
        </div>
      </div>
      <a
        className="btn btn-outline"
        href={`${apiBase()}/admin/sidekiq`}
        target="_blank"
      >
        Open Sidekiq Web
      </a>
      <div className="mt-4">
        <a className="underline" href="/ops/webhooks">
          Webhooks: Dead-letter & Replay
        </a>
      </div>
      <div className="mt-4">
        <a className="underline" href="/ops/rum">
          RUM Dashboard
        </a>
      </div>
      <div className="mt-4 flex gap-4">
        <a className="underline" href="/admin/flags">
          Feature Flags
        </a>
        <a className="underline" href="/admin/plan">
          Plan
        </a>
        <a className="underline" href="/admin/experiments">
          Experiments
        </a>
      </div>
      <div className="mt-4">
        <a className="underline" href="/ops/experiments">
          Experiments Overview
        </a>
      </div>
    </main>
  );
}
