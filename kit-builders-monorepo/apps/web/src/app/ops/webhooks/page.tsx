"use client";
import * as React from "react";
import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function WebhooksOps() {
  const [filter, setFilter] = React.useState<"all" | "dead" | "stored">("all");
  const { data, mutate } = useSWR("/api/app/webhook_events", fetcher, {
    refreshInterval: 5000,
  });
  const replay = async (id: number) => {
    await fetch("/api/app/webhook_events/replay", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    mutate();
  };
  const replayAll = async () => {
    await fetch("/api/app/webhook_events/replay_all", { method: "POST" });
    mutate();
  };
  const replayAllDead = async () => {
    await fetch("/api/app/webhook_events/replay_all", {
      method: "POST",
      body: JSON.stringify({ include_dead: 1 }),
    });
    mutate();
  };
  const replayWindow = async (from: string, to: string) => {
    await fetch("/api/app/webhook_events/replay_all", {
      method: "POST",
      body: JSON.stringify({ from, to }),
    });
    mutate();
  };

  return (
    <main className="mx-auto max-w-[1000px] p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Webhooks: Dead-letter & Replay</h1>
      <div className="flex gap-2 items-center">
        <select
          className="input"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="stored">Stored</option>
          <option value="dead">Dead-letter</option>
        </select>
        <button className="btn btn-outline" onClick={replayAll}>
          Replay All (stored)
        </button>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-outline" onClick={replayAllDead}>
          Replay All (including dead)
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm">Replay by window:</span>
        <input className="input" id="from" type="datetime-local" />
        <input className="input" id="to" type="datetime-local" />
        <button
          className="btn btn-outline"
          onClick={() => {
            const from = (document.getElementById("from") as HTMLInputElement)
              .value;
            const to = (document.getElementById("to") as HTMLInputElement)
              .value;
            if (from && to) replayWindow(from, to);
          }}
        >
          Replay
        </button>
      </div>
      <div className="grid gap-2">
        {(data || [])
          .filter((ev: any) => filter === "all" || ev.status === filter)
          .map((ev: any) => (
            <div
              key={ev.id}
              className="border rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-sm">
                  [{ev.provider}] <b>{ev.status}</b>{" "}
                  <span className="text-xs text-zinc-500">
                    {new Date(ev.created_at).toLocaleString()}
                  </span>
                </div>
                {ev.error && (
                  <div className="text-xs text-red-600">{ev.error}</div>
                )}
              </div>
              <button className="btn btn-outline" onClick={() => replay(ev.id)}>
                Replay
              </button>
            </div>
          ))}
      </div>
    </main>
  );
}
