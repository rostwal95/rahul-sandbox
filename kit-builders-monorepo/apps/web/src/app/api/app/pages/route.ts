import { forward } from "@/lib/proxy";
export async function GET() {
  return forward("/v1/pages");
}
export async function POST(req: Request) {
  // Ensure raw body is preserved; rely on forward() to set JSON content type.
  const raw = await req.text();
  if (process.env.NODE_ENV === "development") {
    console.log("[api] creating page -> forwarding length", raw.length);
  }
  return forward("/v1/pages", { method: "POST", body: raw });
}
