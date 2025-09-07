"use client";
import useSWR from "swr";
import { useState } from "react";
import { SafeList } from "@/components/SafeList";
const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function OrgOverride() {
  const [orgId, setOrgId] = useState(1);
  const { data, mutate } = useSWR(
    `/api/app/feature_flags?org_id=${orgId}`,
    fetcher,
  );
  const toggle = async (key: string, enabled: boolean) => {
    await fetch("/api/app/feature_overrides", {
      method: "POST",
      body: JSON.stringify({ org_id: orgId, key, enabled }),
    });
    mutate();
  };
  return (
    <section className="card p-4 my-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">Org ID</span>
        <input
          className="input w-20"
          type="number"
          value={orgId}
          onChange={(e) => setOrgId(Number(e.currentTarget.value))}
        />
      </div>
      <SafeList
        className="grid gap-2"
        items={data}
        loading={data === undefined}
        error={undefined}
        unexpectedLabel="Unexpected feature flags shape"
        empty={<div className="text-sm text-zinc-500">No flags</div>}
        keyFn={(f: any) => f.key}
        render={(f: any) => (
          <div className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{f.key}</div>
              <div className="text-xs text-zinc-500">
                Merged (global + override)
              </div>
            </div>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={!!f.enabled}
                onChange={(e) => toggle(f.key, e.currentTarget.checked)}
              />{" "}
              Enabled
            </label>
          </div>
        )}
      />
    </section>
  );
}
