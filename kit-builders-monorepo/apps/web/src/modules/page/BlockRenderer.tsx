import { sendRUM } from "@/lib/rum";
import { pickVariant, pickWithAlloc } from "@/lib/ab";
import { imgx } from "@/lib/imgx";
("use client");
function objectPositionFromFocal(f?: { x: number; y: number }) {
  if (!f) return "50% 50%";
  return `${Math.round((f.x || 0.5) * 100)}% ${Math.round(
    (f.y || 0.5) * 100
  )}%`;
}
type Block = { id?: number; order?: number; kind: string; data_json: any };

function Hero({ d }: { d: any }) {
  return (
    <section
      className="my-10 text-center"
      data-hero-variant={d?.variant || undefined}
    >
      <h1 className="text-4xl font-bold">{d.headline}</h1>
      {d.sub && <p className="text-zinc-600 mt-2">{d.sub}</p>}
      {(d.images || d.image) && (
        <div className="mt-4">
          <picture>
            {d.images?.mobile && (
              <source
                media="(max-width: 640px)"
                srcSet={imgx(d.images.mobile, { w: 600, q: 82 })}
              />
            )}
            {d.images?.tablet && (
              <source
                media="(max-width: 1024px)"
                srcSet={imgx(d.images.tablet, { w: 1000, q: 82 })}
              />
            )}
            <img
              loading="eager"
              decoding="async"
              fetchPriority="high"
              src={imgx(d.images?.desktop || d.image, { w: 1200, q: 82 })}
              alt=""
              className="w-full rounded-xl"
              style={{
                objectFit: "cover",
                objectPosition: objectPositionFromFocal(d.focal),
              }}
            />
          </picture>
        </div>
      )}
    </section>
  );
}

function FeatureGrid({ d }: { d: any }) {
  return (
    <section className="my-10">
      <h2 className="text-2xl font-semibold mb-4">{d.title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {(d.items || []).map((it: any, i: number) => (
          <div key={i} className="border rounded-xl p-4">
            <div className="font-medium">{it.title}</div>
            <div className="text-sm text-zinc-600">{it.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ d }: { d: any }) {
  return (
    <section className="my-10">
      <h2 className="text-2xl font-semibold mb-4">{d.title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {(d.items || []).map((it: any, i: number) => (
          <blockquote key={i} className="border rounded-xl p-4 italic">
            “{it.quote}”{" "}
            <span className="not-italic text-sm text-zinc-600">
              — {it.author}
            </span>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function CTA({ d }: { d: any }) {
  return (
    <section
      className="my-10 text-center"
      data-hero-variant={d?.variant || undefined}
    >
      <a
        href={d.url || "#"}
        className="inline-block px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium"
      >
        {d.text || "Get started"}
      </a>
    </section>
  );
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  async function subscribe(email: string, slug?: string) {
    const r = await fetch("/api/public/subscribe", {
      method: "POST",
      body: JSON.stringify({ email, slug }),
    });
    const j = await r.json();
    if (j?.ok) {
      try {
        const s = (globalThis as any).pageSlug || slug || "";
        const v = (document.querySelector("[data-hero-variant]") as HTMLElement)
          ?.dataset?.heroVariant;
        const { sendRUM } = await import("@/lib/rum");
        sendRUM({ kind: "signup", slug: s, variant: v, t: Date.now() });
      } catch (e) {}
    }
    return j;
  }
  const heroes = blocks.filter((b: any) => b.kind === "hero");
  let chosenHeroId: any = null;
  let activeVariant: string | null = null;
  const heroVariants = heroes
    .map((h: any) => h.data_json?.data?.variant)
    .filter(Boolean);
  if (heroVariants.length) {
    const uniq = Array.from(new Set(heroVariants));
    const alloc = (globalThis as any).__hero_alloc as any;
    const chosen = pickWithAlloc(uniq as any, alloc);
    const chosenHero = heroes.find(
      (h: any) => h.data_json?.data?.variant === chosen
    ) as any;
    chosenHeroId = chosenHero?.id || null;
    activeVariant = chosenHero?.data_json?.data?.variant || null;
  }
  return (
    <div>
      {blocks
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((b, i) => {
          if (b.data_json?.html) {
            return (
              <section
                key={b.id || i}
                className="prose max-w-none my-6"
                dangerouslySetInnerHTML={{ __html: b.data_json.html }}
              />
            );
          }
          const d = b.data_json?.data || b.data_json;
          if (b.kind === "hero") {
            if (chosenHeroId && b.id !== chosenHeroId) return null;
            return <Hero key={b.id || i} d={d} />;
          }
          if (b.kind === "feature_grid")
            return <FeatureGrid key={b.id || i} d={d} />;
          if (b.kind === "testimonials")
            return <Testimonials key={b.id || i} d={d} />;
          if (b.kind === "cta") return <CTA key={b.id || i} d={d} />;
          return (
            <section
              key={b.id || i}
              className="prose max-w-none my-6"
              dangerouslySetInnerHTML={{ __html: d?.html || "" }}
            />
          );
        })}
    </div>
  );
}

function Subscribe({ d }: { d: any }) {
  const id = Math.random().toString(36).slice(2);
  return (
    <div className="my-8 text-center">
      <div className="text-xl font-semibold mb-2">
        {d.title || "Subscribe for updates"}
      </div>
      <div className="text-zinc-600 mb-3">
        {d.help || "Get the newsletter in your inbox."}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const email = (document.getElementById(id) as HTMLInputElement).value;
          const slug = (globalThis as any).pageSlug || d.slug || "";
          await fetch("/api/public/subscribe", {
            method: "POST",
            body: JSON.stringify({ email, slug }),
          });
          try {
            const { sendRUM } = await import("@/lib/rum");
            const v = (
              document.querySelector("[data-hero-variant]") as HTMLElement
            )?.dataset?.heroVariant;
            sendRUM({ kind: "signup", slug, variant: v, t: Date.now() });
          } catch (e) {}
          (document.getElementById(id) as HTMLInputElement).value = "";
          alert("Thanks! Check your inbox.");
        }}
        className="flex items-center justify-center gap-2 max-w-md mx-auto"
      >
        <input
          id={id}
          type="email"
          required
          placeholder="your@email.com"
          className="input flex-1"
        />
        <button className="btn btn-solid" type="submit">
          {d.cta || "Subscribe"}
        </button>
      </form>
    </div>
  );
}

function Thankyou({ d }: { d: any }) {
  return (
    <div className="my-10 text-center">
      <h2 className="text-2xl font-semibold mb-2">{d.title || "Thank you!"}</h2>
      <p className="text-zinc-600">
        {d.body || "Please check your inbox to confirm."}
      </p>
    </div>
  );
}
