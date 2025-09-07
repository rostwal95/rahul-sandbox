'use client';
import Cropper from 'react-easy-crop';
import { useCallback, useMemo, useState } from 'react';

async function getCroppedImg(imageSrc: string, crop: any, zoom: number, aspect: number){
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageSrc;
  await new Promise(res => { img.onload = res; });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  const cropPx = {
    x: crop.x * naturalW / 100,
    y: crop.y * naturalH / 100,
    width: crop.width * naturalW / 100,
    height: crop.height * naturalH / 100,
  };
  canvas.width = cropPx.width;
  canvas.height = cropPx.height;
  ctx.drawImage(img, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, cropPx.width, cropPx.height);
  return canvas;
}

function detectFocal(canvas: HTMLCanvasElement){
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0,0,width,height).data;
  // naive "entropy" center: higher contrast/brightness weight
  let sumX=0, sumY=0, sum=0;
  for(let y=0;y<height;y+=4){
    for(let x=0;x<width;x+=4){
      const i = (y*width + x)*4;
      const r=data[i], g=data[i+1], b=data[i+2];
      const lum = 0.2126*r + 0.7152*g + 0.0722*b;
      const weight = Math.abs(128 - lum) + 32; // prefer contrast-ish areas
      sum += weight; sumX += x*weight; sumY += y*weight;
    }
  }
  return { x: (sumX/sum)/width, y: (sumY/sum)/height }; // 0..1
}

export default function HeroImageCropper({ src, onCropped }:{ src: string; onCropped: (result: { variants: Record<string,{ blob: Blob, dataUrl: string }>, focal: {x:number,y:number} })=>void }){
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 40 });
  const [preset, setPreset] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [zoom, setZoom] = useState(1);
  const onDone = useCallback(async ()=>{
    const aspects: Record<string, number> = { desktop: 1200/400, tablet: 1000/400, mobile: 600/600 };
    const out: Record<string,{blob:Blob,dataUrl:string}> = {};
    let focal = { x: .5, y: .5 } as any;
    for (const [key, asp] of Object.entries(aspects)){
      const canvas = await getCroppedImg(src, crop, zoom, asp);
      if (key==='desktop') focal = detectFocal(canvas);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const blob = await (await fetch(dataUrl)).blob();
      out[key] = { blob, dataUrl };
    }
    onCropped({ variants: out, focal });
  }, [src, crop, zoom, onCropped]);
  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 bg-black/5 rounded-xl overflow-hidden">
        <Cropper
          image={src}
          crop={{ x: crop.x, y: crop.y }}
          zoom={zoom}
          aspect={preset==='desktop' ? 1200/400 : preset==='tablet' ? 1000/400 : 600/600}
          onCropChange={(pos)=> setCrop(c=>({ ...c, x: pos.x, y: pos.y }))}
          onZoomChange={setZoom}
          onCropComplete={(crArea, crPixels)=> setCrop(c=>({ ...c, width: crArea.width, height: crArea.height }))}
        />
      </div>
      <div className="flex items-center gap-3">
        <select className="input" value={preset} onChange={e=> setPreset(e.target.value as any)}>
          <option value='desktop'>Desktop 1200×400</option>
          <option value='tablet'>Tablet 1000×400</option>
          <option value='mobile'>Mobile 600×600</option>
        </select>
        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e=> setZoom(Number(e.target.value))} />
        <button className="btn btn-solid" onClick={onDone}>Save Crop</button>
      </div>
    </div>
  );
}
