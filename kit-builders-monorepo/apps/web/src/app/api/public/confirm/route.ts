import { forward } from "@/lib/proxy";
// Simple pass-through for confirm token redirect (used in tests / potential client fetch)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = url.searchParams.get("t");
  return forward(`/v1/public/confirm?t=${encodeURIComponent(t || "")}`, {
    method: "GET",
  });
}
