export function detectDevice(){
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/iPhone|Android.*Mobile/.test(ua)) return 'mobile';
  if (/iPad|Tablet/.test(ua)) return 'tablet';
  return 'desktop';
}
export function sendRUM(event: any){
  const payload = { device: detectDevice(), ...event };
  try {
    navigator.sendBeacon('/api/app/rum', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  } catch {
    fetch('/api/app/rum', { method: 'POST', body: JSON.stringify(payload) });
  }
}
