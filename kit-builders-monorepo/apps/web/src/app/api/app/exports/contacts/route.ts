import { forward } from '@/lib/proxy'; export async function GET(){ return forward('/v1/exports/contacts'); }
