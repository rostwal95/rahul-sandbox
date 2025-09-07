export async function POST(req: Request){
  const { prompt } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey) return new Response(JSON.stringify({ ok:false, error:'OPENAI_API_KEY missing' }), { status: 500 });
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Given a short prompt, output a JSON object with { kind: one of hero|cta|custom, html: string }. Keep HTML minimal and clean." },
      { role: "user", content: prompt }
    ]
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content || '';
  try { const parsed = JSON.parse(text); return new Response(JSON.stringify({ ok:true, block: parsed }), { status: 200 }); } catch(e){}
  // fallback: wrap as custom
  return new Response(JSON.stringify({ ok:true, block: { kind:'custom', html: `<h2>${prompt}</h2><p>Generated section</p>` } }), { status: 200 });
}
