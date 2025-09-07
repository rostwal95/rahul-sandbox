import { cookies } from "next/headers";
import { apiBase } from "./apiBase";

export async function forward(path: string, init?: RequestInit) {
  const api = apiBase();
  const c = await cookies();
  const token = c.get("kit_token")?.value;
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = `${api}${path}`;
  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, cache: "no-store" });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "upstream_unreachable", detail: e?.message }),
      {
        status: 502,
        headers: {
          "content-type": "application/json",
          "x-upstream-status": "0",
          "x-proxy-duration-ms": "0",
        },
      },
    );
  }
  // If unauthorized and we have a token, allow one silent retry (token could be stale)
  if (res.status === 401 && token) {
    try {
      // Placeholder for future refresh endpoint; currently just one retry.
      res = await fetch(url, { ...init, headers, cache: "no-store" });
    } catch {}
  }
  const duration = Date.now() - started;
  const rawBody = await res.text();
  const outHeaders = new Headers(res.headers);
  outHeaders.set("x-upstream-status", String(res.status));
  outHeaders.set("x-proxy-duration-ms", String(duration));
  if (res.status >= 400) {
    console.error("[forward]", {
      path,
      status: res.status,
      duration,
      snippet: rawBody.slice(0, 200),
    });
  }
  return new Response(rawBody, { status: res.status, headers: outHeaders });
}
