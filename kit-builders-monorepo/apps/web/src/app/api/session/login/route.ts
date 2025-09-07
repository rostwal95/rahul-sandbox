import { cookies } from "next/headers";
import { apiBase } from "@/lib/apiBase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    // Prefer localhost directly if reachable to avoid container hostname mapping locally
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const target = base.replace(/\/$/, "") + "/v1/auth/sign_in";
    let r: Response | null = null;
    try {
      r = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email, password } }),
      });
    } catch (err: any) {
      // Upstream unreachable in dev: allow a local fallback demo login
      if (process.env.NODE_ENV !== "production") {
        console.warn("[login] upstream unreachable, using dev fallback");
        const c = await cookies();
        c.set("kit_token", "dev-demo-token", {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        });
        return new Response(JSON.stringify({ ok: true, demo: true }), {
          status: 200,
        });
      }
      throw err;
    }
    const ok = r.ok;
    const token = r.headers.get("Authorization")?.replace("Bearer ", "") || "";
    if (ok && token) {
      const c = await cookies();
      c.set("kit_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    const body = await r.text();
    console.error("[login] upstream failed", r.status, body.slice(0, 300));
    return new Response(JSON.stringify({ ok: false, status: r.status }), {
      status: 401,
    });
  } catch (e: any) {
    console.error("[login] exception", e?.message);
    return new Response(JSON.stringify({ ok: false, error: "login_error" }), {
      status: 500,
    });
  }
}
