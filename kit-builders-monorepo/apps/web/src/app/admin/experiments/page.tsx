"use client";
import useSWR from "swr";
import { SafeList } from "@/components/SafeList";
const fetcher = (u: string) => fetch(u).then((r) => r.json());
export default function Experiments() {
  const { data, mutate } = useSWR("/api/app/experiments", fetcher);
  const createExp = async () => {
    const key = prompt("Experiment key (e.g., hero)") || "";
    const slug = prompt("Slug (optional)") || "";
    const variants = prompt("Variants comma-separated (e.g., A,B)") || "A,B";
    await fetch("/api/app/experiments", {
      method: "POST",
      body: JSON.stringify({
        key,
        slug,
        variants_json: { variants: variants.split(",").map((s) => s.trim()) },
        enabled: true,
      }),
    });
    mutate();
  };
  return (
    <main className="mx-auto max-w-[900px] p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Experiments</h1>
      <button className="btn btn-outline" onClick={createExp}>
        New Experiment
      </button>
      <SafeList
        className="grid gap-2 mt-4"
        items={data}
        loading={data === undefined}
        error={undefined}
        unexpectedLabel="Unexpected experiments shape"
        empty={<div className="text-sm text-zinc-500">No experiments</div>}
        keyFn={(e: any) => e.key + (e.slug || "")}
        render={(e: any) => (
          <a
            className="border rounded-xl p-3 hover:bg-zinc-50"
            href={`/ops/experiments/${e.key}${e.slug ? `?slug=${e.slug}` : ""}`}
          >
            <div className="font-medium">{e.key}</div>
            <div className="text-xs text-zinc-500">Slug: {e.slug || "—"}</div>
            <div className="text-xs text-zinc-500">
              Variants: {(e.variants_json?.variants || []).join(", ")}
            </div>
          </a>
        )}
      />
    </main>
  );
}
