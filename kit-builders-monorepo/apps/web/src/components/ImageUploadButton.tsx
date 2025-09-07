'use client';
import { useState } from 'react';

export default function ImageUploadButton({ onUploaded }:{ onUploaded: (url:string)=>void }){
  const [uploading, setUploading] = useState(false);
  const choose = async (e:any)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    const ps = await fetch('/api/app/uploads/presign', { method:'POST', body: JSON.stringify({ filename: file.name, content_type: file.type }) });
    const { url, headers, publicUrl } = await ps.json();
    const put = await fetch(url, { method:'PUT', headers, body: file });
    setUploading(false);
    if(put.ok) onUploaded(publicUrl);
    else alert('Upload failed');
  };
  return (
    <label className="btn btn-outline cursor-pointer">
      {uploading? 'Uploading…' : 'Upload Image'}
      <input type="file" className="hidden" accept="image/*" onChange={choose} />
    </label>
  );
}
