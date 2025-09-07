export function CTA({
  headline,
  sub,
  cta,
  primary = "#0EA5A4",
}: {
  headline: string;
  sub?: string;
  cta: { text: string; href: string };
  primary?: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
      <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {headline}
      </h3>
      {sub && <p className="mt-2 text-zinc-600 [text-wrap:balance]">{sub}</p>}
      <a
        href={cta.href}
        style={{ backgroundColor: primary }}
        className="mt-6 inline-flex h-10 items-center rounded-lg px-5 text-white shadow-sm motion-safe:transition-all hover:opacity-90 hover:scale-[1.02]"
      >
        {cta.text}
      </a>
    </section>
  );
}
