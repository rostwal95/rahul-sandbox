import { forward } from '@/lib/proxy'; export async function GET(){ return forward('/v1/webhook_events'); }
