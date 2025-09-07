'use client';
import { useState } from 'react';

type Rule = { field: 'email_domain'|'tag'|'opened_last_days'|'clicked_last_days'|'opened_not_clicked_last_days'|'did_not_open_last_days'; op: 'is'; value: string };

export default function SegmentBuilder({ onCreate }:{ onCreate: (name:string, filter:any)=>void }){
  const [name, setName] = useState('New Segment');
  const [rules, setRules] = useState<Rule[]>([{ field:'email_domain', op:'is', value:'example.com' }]);
  const [logic, setLogic] = useState<'AND'|'OR'>('AND');

  const addRule = () => setRules(r => [...r, { field:'tag', op:'is', value:'vip' }]);
  const removeRule = (i:number) => setRules(r => r.filter((_,idx)=>idx!==i));
  const create = () => {
    const filter:any = { logic, rules };
    onCreate(name, filter);
  };

  return (
    <div className="card p-4 space-y-2">
      <div className="font-medium">Segment Builder</div>
      <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Segment name" />
      <div>
        <label className="mr-2 text-sm">Logic</label>
        <select className="input" value={logic} onChange={(e)=>setLogic(e.target.value as any)}>
          <option>AND</option><option>OR</option>
        <option value="opened_not_clicked_last_days">Opened not clicked (days)</option><option value="did_not_open_last_days">Did not open (days)</option></select>
      </div>
      <div className="grid gap-2">
        {rules.map((r,i)=> (
          <div key={i} className="flex gap-2 items-center">
            <select className="input w-40" value={r.field} onChange={(e)=>{
              const v = e.target.value as Rule['field'];
              setRules(prev => prev.map((x,idx)=> idx===i? { ...x, field: v }: x));
            }}>
              <option value="email_domain">Email Domain</option>
              <option value="tag">Tag</option><option value="opened_last_days">Opened last (days)</option><option value="clicked_last_days">Clicked last (days)</option>
            <option value="opened_not_clicked_last_days">Opened not clicked (days)</option><option value="did_not_open_last_days">Did not open (days)</option></select>
            <span className="text-sm">is</span>
            <input className="input" value={r.value} onChange={(e)=>{
              const v = e.target.value;
              setRules(prev => prev.map((x,idx)=> idx===i? { ...x, value: v }: x));
            }} />
            <button className="btn btn-outline" onClick={()=>removeRule(i)}>Remove</button>
          </div>
        ))}
      </div>
      <button className="btn btn-outline" onClick={addRule}>+ Add rule</button>
      <div className="text-right">
        <button className="btn btn-solid" onClick={create}>Create Segment</button>
      </div>
    </div>
  );
}
