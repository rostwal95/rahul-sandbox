export const runtime = "nodejs";
import sharp from "sharp";
// Node runtime Response typing is picky about BodyInit; ensure we hand it a plain ArrayBuffer

export async function GET(req: Request) {
  const u = new URL(req.url);
  const url = u.searchParams.get("url");
  const w = Number(u.searchParams.get("w") || 0) || undefined;
  const h = Number(u.searchParams.get("h") || 0) || undefined;
  const q = Number(u.searchParams.get("q") || 82);

  if (!url) return new Response("missing url", { status: 400 });

  const res = await fetch(url);
  if (!res.ok) return new Response("bad source", { status: 400 });
  const buf = Buffer.from(await res.arrayBuffer());
  const out = await sharp(buf)
    .resize({ width: w, height: h, fit: "cover" })
    .jpeg({ quality: q })
    .toBuffer();
  const u8 = new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
  const ab = u8.buffer.slice(
    u8.byteOffset,
    u8.byteOffset + u8.byteLength
  ) as ArrayBuffer;
  return new Response(ab, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
