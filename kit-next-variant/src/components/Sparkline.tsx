"use client";
export default function Sparkline({ data = [], width = 220, height = 36, padding = 4 }:{data:number[];width?:number;height?:number;padding?:number}){
  const w = width, h = height, pad = padding;
  const len = data.length;
  if (len < 2) return <svg width={w} height={h}></svg>;
  const min = Math.min(...data), max = Math.max(...data);
  const x = (i:number) => pad + (i * (w - 2*pad)) / (len - 1);
  const y = (v:number) => (max === min) ? h/2 : pad + (1 - (v - min) / (max - min)) * (h - 2*pad);
  const points = data.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
  const last = data[len-1], prev = data[len-2];
  const dir = last > prev ? '↑' : last < prev ? '↓' : '→';
  return (
    <div className="mt-2">
      <svg width={w} height={h}><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" /></svg>
      <div className="text-[10px] text-zinc-500 -mt-1">trend {dir}</div>
    </div>
  );
}
