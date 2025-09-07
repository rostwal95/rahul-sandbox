import { forward } from "@/lib/proxy";

// Combined dashboard endpoint: merges summary and series into one JSON payload
// Shape: { summary: <upstream summary>, series: <series data>, meta: { generated_at, upstream_status, series_status, proxy_ms } }
export async function GET() {
  const start = Date.now();
  // Build an absolute base for internal fetch to avoid Node fetch relative URL error
  const port = process.env.PORT || 3000;
  const base = process.env.NEXT_PUBLIC_APP_URL || `http://127.0.0.1:${port}`;
  const [summaryRes, seriesRes] = await Promise.all([
    forward("/v1/dashboard/summary"),
    fetch(`${base}/api/app/dashboard/series`, {
      cache: "no-store",
    }).catch(
      (e) =>
        new Response(JSON.stringify({ error: e.message }), { status: 500 }),
    ),
  ]);
  let summary: any = null;
  let series: any = null;
  try {
    summary = await summaryRes.clone().json();
  } catch {
    summary = null;
  }
  try {
    series = await seriesRes.clone().json();
  } catch {
    series = {};
  }

  // Normalize when upstream unreachable
  if (summaryRes.status === 502 && !summary) {
    summary = { checklist: {}, stats: {}, error: "upstream_unreachable" };
  }
  if (seriesRes.status === 502 && (!series || typeof series !== "object")) {
    series = {};
  }

  const body = {
    summary,
    series,
    meta: {
      generated_at: new Date().toISOString(),
      upstream_status: summaryRes.status,
      series_status: seriesRes.status,
      proxy_ms: Date.now() - start,
    },
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
