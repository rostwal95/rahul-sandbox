import { forward } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return forward(`/v1/segments/${id}/evaluate`);
}
