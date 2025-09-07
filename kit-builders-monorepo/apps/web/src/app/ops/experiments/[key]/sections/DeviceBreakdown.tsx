'use client';
import useSWR from 'swr';
import { useParams, useSearchParams } from 'next/navigation';
const fetcher=(u:string)=> fetch(u).then(r=>r.json());
export default function DeviceBreakdown(){
  const params = useParams<{ key: string }>();
  const sp = useSearchParams(); const slug = sp.get('slug') || '';
  const { data } = useSWR(`/api/app/experiments/results?key=${params.key}${slug?`&slug=${slug}`:''}`, fetcher);
  const rows = (data?.variants||[]).flatMap((v:any)=>{
    const d = v.device || {}; return ['desktop','tablet','mobile','unknown'].map(dev=> ({ variant: v.variant, device: dev, assigned: d[dev]||0, clicks: d[dev+'_clicks']||0, signups: d[dev+'_signups']||0 }));
  });
  if(!rows.length) return null;
  return (
    <section className="card p-4 mt-6">
      <div className="font-medium mb-2">Per-device breakdown</div>
      <div className="overflow-auto">
        <table className="text-sm min-w-[600px]">
          <thead><tr><th className="text-left p-2">Variant</th><th className="p-2">Device</th><th className="p-2 text-right">Assigned</th><th className="p-2 text-right">Clicks</th><th className="p-2 text-right">Signups</th></tr></thead>
          <tbody>
            {rows.map((r:any,i:number)=>(<tr key={i}><td className="p-2">{r.variant}</td><td className="p-2 capitalize">{r.device}</td><td className="p-2 text-right">{r.assigned}</td><td className="p-2 text-right">{r.clicks}</td><td className="p-2 text-right">{r.signups}</td></tr>))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
