import crypto from 'crypto';
const KEY = process.env.NEXT_PUBLIC_IMG_PROXY_KEY || '';
const HOST = process.env.NEXT_PUBLIC_IMG_PROXY_HOST || '';
export function signPath(path: string){
  if(!KEY || !HOST) return `${path}`;
  const h = crypto.createHmac('sha256', KEY).update(path).digest('base64url');
  return `https://${HOST}${path}?s=${h}`;
}
export function imgx(url: string, opts: { w?: number; h?: number; q?: number } = {}){
  const u = new URL('/img', `https://${HOST||'example.com'}`);
  u.searchParams.set('url', url);
  if(opts.w) u.searchParams.set('w', String(opts.w));
  if(opts.h) u.searchParams.set('h', String(opts.h));
  if(opts.q) u.searchParams.set('q', String(opts.q));
  const path = u.pathname + '?' + u.searchParams.toString();
  return signPath(path);
}
