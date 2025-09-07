export async function POST(req: Request){
  const { brief } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey) return new Response(JSON.stringify({ ok:false, error:'OPENAI_API_KEY missing' }), { status: 500 });
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Create a landing page JSON with this schema: { blocks: [ { kind: 'hero', data: { headline, sub, image } } | { kind: 'feature_grid', data: { title, items: [{ title, desc }] } } | { kind: 'testimonials', data: { title, items: [{ quote, author }] } } | { kind: 'cta', data: { text, url } } ] }" },
      { role: "user", content: brief }
    ]
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  let blocks: any[] = [];
  try { blocks = JSON.parse(j.choices?.[0]?.message?.content || '{}').blocks || []; } catch(e){}
  if(!Array.isArray(blocks) || blocks.length===0){
    blocks = [
      { kind: 'hero', data: { headline: brief, sub: 'Insights every week', image: '' } },
      { kind: 'feature_grid', data: { title: 'What you get', items: [{ title:'Tips', desc:'Actionable growth tips' }, { title:'Tools', desc:'Reviews of creator tools' }] } },
      { kind: 'cta', data: { text: 'Join free', url: '#' } }
    ];
  }
  return new Response(JSON.stringify({ ok:true, blocks }), { status: 200 });
}
