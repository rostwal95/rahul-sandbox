'use client';
import { useState } from 'react';
import { usePlan } from '@/hooks/usePlan';

export default function Billing(){
  const plan = usePlan();
  const [loading, setLoading] = useState(false);

  const checkout = async ()=>{
    setLoading(true);
    const r = await fetch('/api/app/billing/checkout', { method: 'POST' });
    const j = await r.json();
    setLoading(false);
    location.href = j.url;
  };

  const portal = async ()=>{
    const r = await fetch('/api/app/billing/portal', { method: 'POST' });
    const j = await r.json();
    location.href = j.url;
  };

  return (
    <main className="mx-auto max-w-[900px] p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="text-zinc-600">Plan: <b>{plan.plan}</b> ({plan.status})</p>
      <div className="flex gap-2">
        <button className="btn btn-solid" onClick={checkout} disabled={loading}>{loading?'Loading…':'Upgrade'}</button>
        <button className="btn btn-outline" onClick={portal}>Manage in Portal</button>
      </div>
    </main>
  );
}
