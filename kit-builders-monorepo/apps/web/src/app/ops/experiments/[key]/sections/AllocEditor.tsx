'use client';
import useSWR from 'swr';
import { useParams, useSearchParams } from 'next/navigation';
const fetcher=(u:string)=> fetch(u).then(r=>r.json());
export default function AllocEditor(){
  const params = useParams<{ key: string }>();
  const sp = useSearchParams(); const slug = sp.get('slug') || '';
  const { data: exps, mutate } = useSWR('/api/app/experiments', fetcher);
  const exp = (exps||[]).find((e:any)=> e.key===params.key && (!slug || e.slug===slug));
  if(!exp) return null;
  const variants:string[] = exp?.variants_json?.variants || [];
  const alloc = exp?.variants_json?.alloc || {};
  const setAlloc = async (key:string, val:number)=>{
    const next = { ...(exp.variants_json||{}), alloc: { ...(alloc||{}), [key]: val } };
    await fetch('/api/app/experiments', { method:'POST', body: JSON.stringify({ key: exp.key, slug: exp.slug, variants_json: next }) });
    mutate();
  };
  return (
    <section className="card p-4 mt-6">
      <div className="font-medium mb-2">Ramp control (traffic allocation %)</div>
      <div className="flex flex-wrap gap-3 items-center">
        {variants.map(v=> (
          <label key={v} className="text-sm flex items-center gap-2">
            <span>{v}</span>
            <input className="input w-20" type="number" min={0} max={100} defaultValue={alloc?.[v] ?? (100/variants.length)} onBlur={e=> setAlloc(v, Number(e.currentTarget.value))} />
            <span>%</span>
          </label>
        ))}
      </div>
      <p className="text-xs text-zinc-500 mt-2">Make sure allocations sum to ~100%. SRM will warn when observed traffic deviates significantly.</p>
    </section>
  );
}
