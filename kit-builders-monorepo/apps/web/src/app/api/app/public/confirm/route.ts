import { forward } from "@/lib/proxy";

// Public confirm endpoint - GET passthrough with query params
export async function GET(req: Request) {
  const u = new URL(req.url);
  const token = u.searchParams.get("token") || "";
  const email = u.searchParams.get("email") || "";
  const qs = new URLSearchParams();
  if (token) qs.set("token", token);
  if (email) qs.set("email", email);
  return forward(
    `/v1/public/confirm${qs.toString() ? `?${qs.toString()}` : ""}`,
  );
}
