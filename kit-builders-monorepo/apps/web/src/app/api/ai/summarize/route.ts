export async function POST(req: Request){
  const { html } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey) return new Response(JSON.stringify({ ok:false, error:'OPENAI_API_KEY missing' }), { status: 500 });
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Summarize the content into a short CTA paragraph." },
      { role: "user", content: html }
    ]
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content || '';
  return new Response(JSON.stringify({ ok:true, text }), { status: 200 });
}
