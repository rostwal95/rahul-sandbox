import { forward } from "@/lib/proxy";

// Simple pass-through health check so the frontend can query /api/health
// and receive upstream status plus proxy timing headers.
export async function GET() {
  return forward("/health");
}
