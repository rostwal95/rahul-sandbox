'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ThankYou({ params }:{ params: { slug: string } }){
  useEffect(()=>{
    try { navigator.sendBeacon('/api/app/rum', new Blob([JSON.stringify({ kind:'confirm_view', slug: params.slug, t: Date.now() })], { type: 'application/json' })); } catch {}
  }, []);
  return (
    <main className="mx-auto max-w-[800px] p-6 text-center">
      <h1 className="text-3xl font-semibold mb-2">You're in 🎉</h1>
      <p className="text-zinc-600">Thanks for confirming. Your first email is on the way.</p>
      <div className="mt-6"><Link href={`/p/${params.slug}`} className="btn btn-outline">Back to site</Link></div>
    </main>
  );
}
