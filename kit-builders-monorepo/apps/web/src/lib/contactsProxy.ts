import { forward } from '@/lib/proxy';
export async function GET(){ return forward('/v1/contacts'); }
export async function POST(req: Request){
  const body = await req.text();
  return forward('/v1/contacts/import', { method:'POST', body });
}
