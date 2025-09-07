import { forward } from '@/lib/proxy'; export async function POST(){ return forward('/v1/billing/portal',{method:'POST'}); }
