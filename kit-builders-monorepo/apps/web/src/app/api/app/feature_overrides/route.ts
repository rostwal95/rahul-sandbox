import { forward } from '@/lib/proxy'; export async function POST(req:Request){ const b=await req.text(); return forward('/v1/feature_overrides', { method:'POST', body:b }); }
