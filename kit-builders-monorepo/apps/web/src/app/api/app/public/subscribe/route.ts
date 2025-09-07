import { forward } from "@/lib/proxy";

// Public subscribe endpoint - POST only
export async function POST(req: Request) {
  const body = await req.text();
  return forward("/v1/public/subscribe", { method: "POST", body });
}
