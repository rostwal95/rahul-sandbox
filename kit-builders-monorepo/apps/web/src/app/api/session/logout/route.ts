import { cookies } from "next/headers";
export async function POST() {
  const c = await cookies();
  c.delete("kit_token");
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
