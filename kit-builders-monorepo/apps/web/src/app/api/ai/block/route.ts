export async function POST(req: Request){
  const { kind, data, html } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey) return new Response(JSON.stringify({ ok:false, error:'OPENAI_API_KEY missing' }), { status: 500 });
  const prompt = kind === 'hero'
    ? "Rewrite hero: keep structure { headline, sub, image? }, improve clarity."
    : kind === 'feature_grid'
    ? "Rewrite feature_grid: keep items, improve titles/descriptions."
    : kind === 'testimonials'
    ? "Rewrite testimonials: keep authors, tighten quotes."
    : "Rewrite HTML block for clarity.";
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: html ? html : JSON.stringify(data || {}) }
    ]
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  const content = j.choices?.[0]?.message?.content || (html || JSON.stringify(data||{}));
  if (html){
    return new Response(JSON.stringify({ ok:true, html: content }), { status: 200 });
  }
  let obj: any = null;
  try { obj = JSON.parse(content); } catch(e) {}
  return new Response(JSON.stringify({ ok:true, data: obj || data }), { status: 200 });
}
