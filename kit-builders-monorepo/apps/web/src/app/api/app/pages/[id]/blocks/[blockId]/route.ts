import { forward } from "@/lib/proxy";
import { NextRequest } from "next/server";

type BlockParams = { id: string; blockId: string };

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<BlockParams> },
) {
  const { id, blockId } = await context.params;
  const body = await req.text();
  return forward(`/v1/pages/${id}/blocks/${blockId}`, {
    method: "PATCH",
    body,
  });
}
export async function DELETE(
  _: NextRequest,
  context: { params: Promise<BlockParams> },
) {
  const { id, blockId } = await context.params;
  return forward(`/v1/pages/${id}/blocks/${blockId}`, { method: "DELETE" });
}
