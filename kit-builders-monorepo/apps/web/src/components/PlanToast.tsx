'use client';
import { useState } from 'react';

export default function PlanToast({ message = 'This feature requires a paid plan.' }:{ message?: string }){
  const [hidden, setHidden] = useState(false);
  const openPortal = async ()=>{
    const r = await fetch('/api/app/billing/portal', { method:'POST' });
    const j = await r.json();
    location.href = j.url;
  };
  if(hidden) return null;
  return (
    <div className="fixed right-4 top-4 z-50 card p-4 shadow-xl flex items-center gap-3">
      <div>{message}</div>
      <button className="btn btn-outline" onClick={openPortal}>Manage Plan</button>
      <button className="btn btn-solid" onClick={()=> location.href='/billing'}>Upgrade</button>
      <button className="btn" onClick={()=> setHidden(true)}>✕</button>
    </div>
  );
}
