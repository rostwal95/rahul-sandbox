import { NextRequest } from "next/server";

// Returns simple timeseries for dashboard sparklines.
// Shape: { metricKey: number[] } values normalized 0..1 but not strictly required; frontend normalizes.

export async function GET(_req: NextRequest) {
  // In real implementation, fetch from analytics store.
  // Here we generate deterministic pseudo data with slight variance.
  const keys = [
    "subscribers",
    "avg_open",
    "deliverability",
    "active_flags",
  ] as const;
  const out: Record<string, number[]> = {};
  for (const k of keys) {
    const seed = k.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const series: number[] = [];
    for (let i = 0; i < 16; i++) {
      const base = Math.sin((i + (seed % 13)) * 0.55) * 0.4 + 0.5; // 0.1..0.9 range
      const noise = ((seed * 31 + i * 17) % 100) / 1000 - 0.05; // -0.05..0.05
      series.push(Math.min(0.95, Math.max(0.05, base + noise)));
    }
    out[k] = series;
  }
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60",
    },
  });
}
