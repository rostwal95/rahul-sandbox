'use client';
import { Landing } from '@kit/templates';

export default function TemplatesGallery({ onPick }:{ onPick: (tpl: any)=>void }){
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {Landing.templates.map(tpl => (
        <button key={tpl.id} className="card p-4 text-left hover:bg-zinc-50" onClick={()=>onPick(tpl)}>
          <div className="font-medium">{tpl.name}</div>
          <div className="text-xs text-zinc-500 mt-1">Blocks: {tpl.blocks.length}</div>
        </button>
      ))}
    </div>
  );
}
