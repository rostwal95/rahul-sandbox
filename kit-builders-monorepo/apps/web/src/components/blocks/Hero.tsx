export type HeroProps = {
  headline: string;
  sub?: string;
  cta?: { text: string; href: string };
  imageUrl?: string; // Unsplash-picked image
  align?: "left" | "center";
  primary?: string; // theme primary
};
export function Hero({
  headline,
  sub,
  cta,
  imageUrl,
  align = "center",
  primary = "#0EA5A4",
}: HeroProps) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-zinc-200 shadow-sm p-10 grid gap-8 md:grid-cols-2 md:items-center">
      <div className={align === "center" ? "text-center md:text-left" : ""}>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          {headline}
        </h1>
        {sub && <p className="mt-3 text-zinc-600 [text-wrap:balance]">{sub}</p>}
        {cta && (
          <a
            href={cta.href}
            style={{ backgroundColor: primary }}
            className="mt-6 inline-flex h-10 items-center rounded-lg px-4 text-white shadow-sm motion-safe:transition-all hover:opacity-90 hover:scale-[1.02]"
          >
            {cta.text}
          </a>
        )}
      </div>
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
}
