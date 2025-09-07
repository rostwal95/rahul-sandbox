'use client';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (u:string)=> fetch(u).then(r=>r.json());

export default function ContactTimeline({ params }:{ params: { id: string } }){
  const { data: events } = useSWR(`/api/app/events?contact_id=${params.id}`, fetcher);
  const timeline = (events||[]).map((e:any)=> ({
    at: new Date(e.created_at).getTime(),
    label: e.payload?.kind || 'event',
    detail: e.payload?.url || e.payload?.message || '',
    device: e.payload?.device || '',
  })).sort((a:any,b:any)=> a.at - b.at);

  return (
    <main className="mx-auto max-w-[1100px] p-6">
      <Link href={`/audience/${params.id}`} className="text-sm text-zinc-600">← Back</Link>
      <h1 className="text-2xl font-semibold mb-4">Timeline</h1>
      <div className="overflow-x-auto py-6">
        <div className="relative h-32 min-w-[800px]">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t" />
          <div className="absolute inset-0 flex items-center">
            {timeline.map((t:any,i:number)=>(
              <div key={i} className="relative" style={{ left: `${(i/(timeline.length-1||1))*100}%` }}>
                <div className="w-3 h-3 bg-emerald-500 rounded-full -translate-x-1/2" />
                <div className="absolute -translate-x-1/2 mt-2 text-xs text-center w-48">
                  <div className="font-medium">{t.label}</div>
                  {t.detail && <div className="truncate"><a className='underline' href={t.detail.startsWith('http')? t.detail : '#'} target="_blank" rel="noreferrer">{t.detail}</a></div>}
                  {t.broadcast_id && <a className='text-xs underline' href={`/analytics/broadcast/${t.broadcast_id}?url=${encodeURIComponent(t.detail||'')}`}>View broadcast</a>}
                  {t.device && <div className="text-zinc-500">{t.device}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
