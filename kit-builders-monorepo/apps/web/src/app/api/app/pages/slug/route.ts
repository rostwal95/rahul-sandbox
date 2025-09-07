import { forward } from "@/lib/proxy";

// GET /api/app/pages/slug?slug=landing-slug -> /v1/pages/slug?slug=landing-slug
export async function GET(req: Request) {
  const u = new URL(req.url);
  const slug = u.searchParams.get("slug") || "";
  return forward(`/v1/pages/slug?slug=${encodeURIComponent(slug)}`);
}
