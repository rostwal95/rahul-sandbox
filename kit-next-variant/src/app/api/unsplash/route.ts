import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "placeholder";
  // Return mock images (would proxy Unsplash in real impl)
  const images = Array.from({ length: 8 }, (_, i) => ({
    id: `${q}-${i}`,
    src: `https://picsum.photos/seed/${encodeURIComponent(q)}-${i}/600/400`,
  }));
  return Response.json({ query: q, images });
}
