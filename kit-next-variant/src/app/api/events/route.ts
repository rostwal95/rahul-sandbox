import { NextRequest } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  type: z.string(),
  message: z.string(),
  meta: z.any().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
    });
  }
  // In a real impl, persist to DB/external analytics. Here we just echo.
  return Response.json({ ok: true, received: parsed.data, at: Date.now() });
}
