import { forward } from "@/lib/proxy";

// POST /api/app/uploads/multipart/list_parts -> /v1/uploads/multipart/list_parts
export async function POST(req: Request) {
  const body = await req.text();
  return forward("/v1/uploads/multipart/list_parts", { method: "POST", body });
}
