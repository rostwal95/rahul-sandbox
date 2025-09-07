export function getVisitorId(){
  const k = 'kit_vid';
  if(typeof document==='undefined') return '';
  const fromCookie = document.cookie.split('; ').find(x=> x.startsWith(k+'='))?.split('=')[1];
  if(fromCookie) return fromCookie;
  const v = Math.random().toString(36).slice(2);
  document.cookie = `${k}=${v}; path=/; max-age=31536000; SameSite=Lax`;
  return v;
}
export function pickVariant(variants: string[], seed?: string){
  if(!variants.length) return '';
  const s = seed || getVisitorId();
  let h = 0; for (let i=0;i<s.length;i++) { h = (h*31 + s.charCodeAt(i)) & 0xffffffff; }
  return variants[Math.abs(h) % variants.length];
}


export function pickWithAlloc(variants: string[], alloc: Record<string, number>|undefined, seed?: string){
  if(!variants.length) return '';
  const s = seed || getVisitorId();
  let h = 0; for (let i=0;i<s.length;i++) { h = (h*31 + s.charCodeAt(i)) & 0xffffffff; }
  const r = Math.abs(h % 10000) / 100.0; // 0..100
  if(!alloc) return variants[Math.abs(h) % variants.length];
  let acc = 0;
  for(const v of variants){
    const pct = Number(alloc[v] || 0);
    acc += pct;
    if(r < acc) return v;
  }
  return variants[0];
}
