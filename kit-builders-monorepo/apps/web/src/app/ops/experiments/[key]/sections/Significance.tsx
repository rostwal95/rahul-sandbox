'use client';
import useSWR from 'swr';
import { useParams, useSearchParams } from 'next/navigation';
const fetcher=(u:string)=> fetch(u).then(r=>r.json());
export default function Significance(){
  const params = useParams<{ key: string }>();
  const sp = useSearchParams(); const slug = sp.get('slug') || '';
  const { data } = useSWR(`/api/app/experiments/results?key=${params.key}${slug?`&slug=${slug}`:''}`, fetcher);
  const s = data?.significance;
  if(!s) return null;
  return (
    <section className="card p-4 mt-6">
      <div className="font-medium mb-2">Significance</div>
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div><div className="text-zinc-500">Clicks</div><div>χ²={s.clicks.chi?.toFixed?.(3)} · df={s.clicks.df} · p={s.clicks.p?.toFixed?.(4)}</div></div>
        <div><div className="text-zinc-500">Signups</div><div>χ²={s.signups.chi?.toFixed?.(3)} · df={s.signups.df} · p={s.signups.p?.toFixed?.(4)}</div></div>
        <div><div className="text-zinc-500">SRM (assignments vs allocation)</div><div>χ²={s.srm.chi?.toFixed?.(3)} · df={s.srm.df} · p={s.srm.p?.toFixed?.(4)}</div></div>
      </div>
      <p className="text-xs text-zinc-500 mt-2">p &lt; 0.05 suggests statistically significant differences. SRM p &lt; 0.01 may indicate allocation or tracking issues.</p>
    </section>
  );
}
