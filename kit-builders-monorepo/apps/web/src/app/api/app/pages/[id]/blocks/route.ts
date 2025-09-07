import { forward } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forward(`/v1/pages/${id}/blocks`);
}
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await req.text();
  return forward(`/v1/pages/${id}/blocks`, { method: "POST", body });
}
