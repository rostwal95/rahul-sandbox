import { forward } from '@/lib/proxy'; export async function POST(req:Request){ const b=await req.text(); return forward('/v1/webhook_events/replay', { method:'POST', body:b }); }
