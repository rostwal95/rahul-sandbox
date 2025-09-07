import { forward } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(_.url);
  const withBlocks = url.searchParams.get("with") === "blocks";
  return forward(`/v1/pages/${id}${withBlocks ? "?with=blocks" : ""}`);
}
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await req.text();
  return forward(`/v1/pages/${id}`, { method: "PATCH", body });
}
export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forward(`/v1/pages/${id}`, { method: "DELETE" });
}
