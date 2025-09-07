import { forward } from "@/lib/proxy";

// Events resource (index/create)
export async function GET() {
  return forward("/v1/events");
}
export async function POST(req: Request) {
  const body = await req.text();
  return forward("/v1/events", { method: "POST", body });
}
