'use client';
import { useState } from 'react';

export default function MultiUploader({ onUploaded }:{ onUploaded: (url:string)=>void }){
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);

  const choose = async (e:any)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setStatus('starting');
    let uploadId = '';
    let key = '';
    const resume = localStorage.getItem(`mp:${file.name}`);
    if(resume){ try { const saved = JSON.parse(resume); uploadId = saved.uploadId; key = saved.key; } catch(e){} }
    const create = uploadId? { ok: true } as any : await fetch('/api/app/uploads/multipart/create', { method:'POST', body: JSON.stringify({ filename: file.name, content_type: file.type }) });
    if(!uploadId){ const j = await (create as any).json(); uploadId = j.uploadId; key = j.key; localStorage.setItem(`mp:${file.name}`, JSON.stringify({ uploadId, key })); }

    const partSize = 5 * 1024 * 1024; // 5MB
    const parts = Math.ceil(file.size / partSize);
    const etags: Array<{ ETag: string, PartNumber: number }> = [];
    let uploaded = [] as number[];
    if(uploadId){ const lp = await fetch('/api/app/uploads/multipart/list_parts', { method:'POST', body: JSON.stringify({ uploadId, key }) }); const lj = await lp.json(); uploaded = (lj.parts||[]).map((p:any)=>p.partNumber); }
    for (let i=0;i<parts;i++){ if(uploaded.includes(i+1)) { setProgress(Math.round(((i+1)/parts)*100)); continue; }
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);
      const ps = await fetch('/api/app/uploads/multipart/presign_part', { method:'POST', body: JSON.stringify({ uploadId, key, partNumber: i+1 }) });
      const { url } = await ps.json();
      const md5 = await crypto.subtle.digest('MD5', await blob.arrayBuffer());
      const b64 = btoa(String.fromCharCode(...new Uint8Array(md5)));
      const r = await fetch(url, { method:'PUT', body: blob, headers: { 'Content-MD5': b64 } });
      if(!r.ok){ setStatus('failed'); return; }
      const etag = r.headers.get('ETag') || '';
      etags.push({ ETag: etag, PartNumber: i+1 });
      setProgress(Math.round(((i+1)/parts)*100));
    }
    const complete = await fetch('/api/app/uploads/multipart/complete', { method:'POST', body: JSON.stringify({ uploadId, key, parts: etags.map(p=>({ etag: p.ETag, partNumber: p.PartNumber })) }) });
    const j = await complete.json();
    if(j.ok){ onUploaded(j.publicUrl); setStatus('done'); localStorage.removeItem(`mp:${file.name}`); } else { setStatus('failed'); }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="btn btn-outline cursor-pointer">
        Large Upload
        <input type="file" className="hidden" onChange={choose} />
      </label>
      {status!=='idle' && <span className="text-sm text-zinc-600">{status} {progress?`(${progress}%)`:''}</span>}
    </div>
  );
}
