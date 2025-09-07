import { forward } from '@/lib/proxy';
export async function GET(){ return forward('/v1/segments'); }
export async function POST(req: Request){ const b = await req.text(); return forward('/v1/segments', { method:'POST', body: b }); }
