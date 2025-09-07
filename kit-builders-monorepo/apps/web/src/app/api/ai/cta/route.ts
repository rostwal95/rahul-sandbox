export async function POST(req: Request){
  const { product, audience, tone } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey) return new Response(JSON.stringify({ ok:false, error:'OPENAI_API_KEY missing' }), { status: 500 });
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Generate a crisp call-to-action line suitable for email or landing page buttons. 6 words max." },
      { role: "user", content: `Product: ${product}\nAudience: ${audience}\nTone: ${tone||'neutral'}` }
    ]
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content?.trim() || 'Get started';
  return new Response(JSON.stringify({ ok:true, text }), { status: 200 });
}
