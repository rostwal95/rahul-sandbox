'use client';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (u:string)=> fetch(u).then(r=>r.json());

export default function ContactDetail({ params }:{ params: { id: string } }){
  const { data: contacts } = useSWR('/api/app/contacts', fetcher);
  const contact = (contacts||[]).find((c:any)=> String(c.id)===params.id);
  const { data: events } = useSWR(`/api/app/events?contact_id=${params.id}`, fetcher);
  const { data: deliveries } = useSWR(`/api/app/deliveries?contact_id=${params.id}`, fetcher);

  return (
    <main className="mx-auto max-w-[900px] p-6 space-y-6">
      <Link href="/audience" className="text-sm text-zinc-600">← Back to Audience</Link>
      <h1 className="text-2xl font-semibold">{contact?.email}</h1>
      <a className='text-sm underline' href={`./${params.id}/timeline`}>View timeline →</a>
      <div className="grid md:grid-cols-2 gap-4">
        <section className="card p-4">
          <div className="font-medium mb-2">Deliveries</div>
          <div className="grid gap-2">
            {(deliveries||[]).map((d:any)=>(
              <div key={d.id} className="border rounded-xl p-2 flex items-center justify-between">
                <div>
                  <div className="text-sm">Broadcast #{d.broadcast_id} — <b>{d.status}</b></div>
                  <div className="text-xs text-zinc-500">Sent: {new Date(d.created_at).toLocaleString()}</div>
                </div>
                <div className="text-xs text-zinc-600">
                  {d.opened_at && <div>Opened: {new Date(d.opened_at).toLocaleString()}</div>}
                  {d.clicked_at && <div>Clicked: {new Date(d.clicked_at).toLocaleString()}</div>}
                  {d.bounce_reason && <div className="text-red-600">Bounce: {d.bounce_reason}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-4">
          <div className="font-medium mb-2">Event log <span className='text-xs text-zinc-500'>(click URLs highlighted)</span></div>
          <div className="grid gap-2">
            {(events||[]).map((e:any)=>(
              <div key={e.id} className="border rounded-xl p-2">
                <div className="text-xs text-zinc-500">{new Date(e.created_at).toLocaleString()}</div>
                <pre className="text-xs overflow-auto">{(e.payload?.kind==='email_click'? e.payload.url : JSON.stringify(e.payload, null, 2))}</pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
