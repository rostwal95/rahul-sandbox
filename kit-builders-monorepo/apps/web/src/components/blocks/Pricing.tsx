export type PricingTier = {
  name: string;
  price: number;
  features: string[];
  cta: { text: string; href: string };
};
export function Pricing({
  tiers,
  highlight = 1,
  primary = "#0EA5A4",
}: {
  tiers: PricingTier[];
  highlight?: number;
  primary?: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
      <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
        {tiers.map((t, i) => {
          const featured = i === highlight;
          return (
            <div
              key={t.name}
              className={[
                "rounded-xl border p-6 flex flex-col transition-shadow motion-safe:transition",
                featured
                  ? "border-teal-600 shadow-md"
                  : "border-zinc-200 hover:shadow-md",
              ].join(" ")}
            >
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                {t.name}
              </h3>
              <div className="mt-2 text-3xl font-semibold text-zinc-900">
                ${t.price}
                <span className="text-base font-normal text-zinc-500">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="pl-5 [text-wrap:pretty]">
                    • {f}
                  </li>
                ))}
              </ul>
              <a
                href={t.cta.href}
                style={{ backgroundColor: primary }}
                className="mt-6 inline-flex w-full justify-center rounded-lg py-2 text-white shadow-sm motion-safe:transition-all hover:opacity-90 hover:scale-[1.02]"
              >
                {t.cta.text}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
