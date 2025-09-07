import { forward } from "@/lib/proxy";
export async function GET(){ return forward('/v1/broadcasts'); }
export async function POST(req: Request){ const body = await req.text(); return forward('/v1/broadcasts', { method:'POST', body }); }
