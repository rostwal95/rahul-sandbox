'use client';
import useSWR from 'swr';
const fetcher=(u:string)=> fetch(u).then(r=>r.json());
export default function PlanAdmin(){
  const { data, mutate } = useSWR('/api/app/org', fetcher);
  const setPlan = async (plan:string)=>{ await fetch('/api/app/org', { method:'POST', body: JSON.stringify({ plan }) }); mutate(); };
  const plans = ['Starter','Pro','Business'];
  return (
    <main className="mx-auto max-w-[800px] p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Plan</h1>
      <div className="text-sm text-zinc-600">Current: <b>{data?.plan || '—'}</b></div>
      <div className="flex gap-2">{plans.map(p=> <button key={p} className="btn btn-outline" onClick={()=> setPlan(p)}>{p}</button>)}</div>
      <p className="text-xs text-zinc-500">Some features (e.g., advanced analytics) may be gated by plan.</p>
    </main>
  );
}
