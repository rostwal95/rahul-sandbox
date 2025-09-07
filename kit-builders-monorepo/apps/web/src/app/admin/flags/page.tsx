"use client";
import OrgOverride from "./sections/OrgOverride";
import useSWR from "swr";
import { SafeList } from "@/components/SafeList";
const fetcher = (u: string) => fetch(u).then((r) => r.json());
export default function Flags() {
  const { data, mutate } = useSWR("/api/app/feature_flags", fetcher);
  const toggle = async (key: string, enabled: boolean) => {
    await fetch("/api/app/feature_flags", {
      method: "POST",
      body: JSON.stringify({ key, enabled }),
    });
    mutate();
  };
  const setPct = async (key: string, rollout_pct: number) => {
    await fetch("/api/app/feature_flags", {
      method: "POST",
      body: JSON.stringify({ key, rollout_pct }),
    });
    mutate();
  };
  return (
    <main className="mx-auto max-w-[900px] p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Feature Flags</h1>
      <div className="text-sm text-zinc-600">Org override:</div>
      <OrgOverride />
      <SafeList
        className="grid gap-2"
        items={data}
        loading={data === undefined}
        error={undefined}
        unexpectedLabel="Unexpected flags shape"
        empty={<div className="text-sm text-zinc-500">No flags</div>}
        keyFn={(f: any) => f.key}
        render={(f: any) => (
          <div className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{f.key}</div>
              <div className="text-xs text-zinc-500">
                Rollout: {f.rollout_pct}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input w-24"
                defaultValue={f.rollout_pct}
                onBlur={(e) => setPct(f.key, Number(e.currentTarget.value))}
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  defaultChecked={f.enabled}
                  onChange={(e) => toggle(f.key, e.currentTarget.checked)}
                />{" "}
                Enabled
              </label>
            </div>
          </div>
        )}
      />
    </main>
  );
}
