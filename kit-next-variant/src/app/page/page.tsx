"use client";

import TopBar from "@/components/TopBar";
import OnboardingDrawer from "@/components/OnboardingDrawer";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { toast } from "@/components/ToastHost";
import { Check, AlertTriangle } from "lucide-react";

const LP_TEMPLATES = [
  {
    id: "creator",
    name: "Creator Newsletter",
    headline: "Join my newsletter",
    sub: "Weekly insights on building and launching.",
    bullets: ["Actionable tips", "Behind‑the‑scenes", "Curated links"],
    cta: "Subscribe free",
  },
  {
    id: "product",
    name: "Product Launch",
    headline: "Be first to try [Your Product]",
    sub: "Early access + a 20% launch discount for subscribers.",
    bullets: [
      "Exclusive early features",
      "Founder Q&A",
      "Special launch price",
    ],
    cta: "Get early access",
  },
  {
    id: "ebook",
    name: "Free eBook Lead Magnet",
    headline: "Free eBook: The 7 Launch Levers",
    sub: "Get the 28‑page guide + templates direct to your inbox.",
    bullets: ["7 proven levers", "Plug‑and‑play templates", "Bonus checklist"],
    cta: "Send me the eBook",
  },
  {
    id: "webinar",
    name: "Webinar Registration",
    headline: "Live Workshop: Ship Your First 100 Emails",
    sub: "Thursday 7pm — seat is limited, replay included.",
    bullets: ["Live Q&A", "Examples that work", "Replay access"],
    cta: "Reserve my seat",
  },
];

function genHeadlines(
  topic = "your project",
  value = "results",
  tone = "Friendly"
) {
  const variants = [
    `Join the journey: ${topic}`,
    `Get ${value} with ${topic}`,
    `Inside: how we’re building ${topic}`,
    `${tone === "Urgent" ? "Now live:" : "New:"} ${topic}`,
    `From idea to launch: ${topic}`,
  ];
  return variants.slice(0, 5);
}

export default function PublishedLandingPage() {
  const snapshot = useAppStore((s) => s.publishedSnapshot);
  const hasPublished = useAppStore((s) => s.hasPublished);
  const incViews = useAppStore((s) => s.incViews);
  const incSignups = useAppStore((s) => s.incSignups);
  const snapshotHistory = useAppStore((s) => s.snapshotHistory) || [];
  // Count a view on mount if published
  useEffect(() => {
    if (hasPublished) incViews(1, "view");
  }, [hasPublished, incViews]);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [lp, setLp] = useState({
    headline: "Join my newsletter",
    sub: "Weekly insights",
    bullets: ["Tips", "Stories", "Links"],
    cta: "Subscribe",
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const s = localStorage.getItem("kit_draft_page");
      if (s) setLp(JSON.parse(s));
    } catch {}
  }, []);

  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const variants = useMemo(() => {
    if (!snapshot) return [] as typeof snapshotHistory;
    return snapshotHistory.filter((h) => h.variant);
  }, [snapshot, snapshotHistory]);
  useEffect(() => {
    if (snapshot && variants.length && !activeVariantId) {
      setActiveVariantId(snapshot.id || variants[0].id);
    }
  }, [snapshot, variants, activeVariantId]);
  const activeVariantData = useMemo(() => {
    if (!snapshot) return null;
    if (!activeVariantId || activeVariantId === snapshot.id) return snapshot;
    const found = snapshotHistory.find((h) => h.id === activeVariantId);
    return found
      ? { ...found.data, ts: found.ts, variant: found.variant, id: found.id }
      : snapshot;
  }, [snapshot, activeVariantId, snapshotHistory]);
  const viewModel = activeVariantData ?? snapshot ?? lp;
  const dirty = useMemo(() => {
    if (!snapshot) return false;
    return (
      snapshot.headline !== lp.headline ||
      snapshot.sub !== lp.sub ||
      snapshot.cta !== lp.cta ||
      (snapshot.theme || "") !== (lp as any).theme ||
      snapshot.bullets.join("|") !== lp.bullets.join("|")
    );
  }, [snapshot, lp]);

  const [topic, setTopic] = useState("your project");
  const [benefit, setBenefit] = useState("better results");
  const [tone, setTone] = useState("Friendly");
  const ideas = genHeadlines(topic, benefit, tone);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  return (
    <div>
      <TopBar onOpenOnboarding={() => setOnboardOpen(true)} />
      <main className="mx-auto max-w-[900px] px-4 py-6">
        <h1 className="text-xl font-semibold mb-2">
          {snapshot ? "Live Landing Page" : "Draft Landing Page"}
        </h1>
        {snapshot ? (
          <div className="flex items-center gap-2 text-xs mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] font-medium">
              <Check className="h-3 w-3" /> Published
            </span>
            {dirty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500">
                <AlertTriangle className="h-3 w-3" /> Draft changes pending
                republish
              </span>
            )}
            {snapshot?.ts && (
              <span className="text-[10px] text-muted-2">
                Last publish: {new Date(snapshot.ts).toLocaleString()}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted mb-4">
            No published snapshot yet – this is a local draft preview.
          </p>
        )}

        {!snapshot && (
          <section className="relative mb-10">
            <div
              className="absolute inset-0 pointer-events-none opacity-70"
              aria-hidden
            >
              <div className="h-full w-full bg-[radial-gradient(circle_at_40%_20%,rgba(var(--accent-rgb,99,102,241),0.15),transparent_70%)]" />
            </div>
            {/* Full bleed wrapper */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12">
              <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
                <div className="space-y-1">
                  <h2 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-2">
                    Starter Templates
                  </h2>
                  <p className="text-[11px] text-muted-2 max-w-[520px]">
                    Pick a starting point. Applies headline, sub copy, bullets &
                    CTA instantly. You can still tweak everything below.
                  </p>
                </div>
                {activeTemplateId && (
                  <div className="text-[10px] px-2 py-1 rounded-md bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] font-medium">
                    Selected: {activeTemplateId}
                  </div>
                )}
              </div>
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {LP_TEMPLATES.map((t) => {
                  const active = activeTemplateId === t.id;
                  return (
                    <button
                      key={t.id}
                      className={`group relative text-left rounded-2xl border p-5 overflow-hidden transition focus:outline-none focus:ring-2 focus:ring-indigo-400/40 backdrop-blur-sm shadow-sm hover:shadow-md ${
                        active
                          ? "border-[rgba(var(--accent-rgb,99,102,241),0.6)] ring-1 ring-[rgba(var(--accent-rgb,99,102,241),0.5)] bg-[linear-gradient(135deg,rgba(var(--accent-rgb,99,102,241),0.18),rgba(var(--bg-2),0.55))]"
                          : "border-[rgba(var(--border),0.5)] bg-[linear-gradient(135deg,rgba(var(--bg-1),0.85),rgba(var(--bg-2),0.55))]"
                      }`}
                      onClick={() => {
                        setLp((s) => ({
                          ...s,
                          headline: t.headline,
                          sub: t.sub,
                          bullets: t.bullets,
                          cta: t.cta,
                        }));
                        setActiveTemplateId(t.id);
                      }}
                    >
                      <div className="absolute inset-px rounded-[15px] pointer-events-none opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_85%_22%,rgba(var(--accent-rgb,99,102,241),0.25),transparent_70%)]" />
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center text-[11px] font-semibold tracking-wide ${
                            active
                              ? "bg-[rgba(var(--accent-rgb,99,102,241),0.25)] text-[rgb(var(--accent))]"
                              : "bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))]"
                          }`}
                        >
                          {t.name
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium tracking-tight leading-tight">
                              {t.name}
                            </span>
                            {active && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-2 line-clamp-1">
                            {t.headline}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-2 opacity-0 group-hover:opacity-100 transition">
                          {active ? "✔" : "Apply →"}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-4 text-[11px] text-muted-2">
                        <ul className="flex-1 space-y-0.5 min-w-0">
                          {t.bullets.slice(0, 3).map((b) => (
                            <li key={b} className="truncate">
                              • {b}
                            </li>
                          ))}
                        </ul>
                        <div className="w-24 shrink-0 space-y-1">
                          <div className="font-medium text-[10px] tracking-wide uppercase text-muted">
                            CTA
                          </div>
                          <div className="truncate">{t.cta}</div>
                          <div className="font-medium text-[10px] tracking-wide uppercase text-muted mt-2">
                            Type
                          </div>
                          <div className="truncate">
                            {t.name.includes("Launch")
                              ? "Launch"
                              : t.name.includes("Webinar")
                              ? "Event"
                              : "General"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {!snapshot && (
          <div className="card p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-500">Topic</label>
                <Input
                  value={topic}
                  onChange={(e: any) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Benefit</label>
                <Input
                  value={benefit}
                  onChange={(e: any) => setBenefit(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Tone</label>
                <select
                  className="input w-full"
                  value={tone}
                  onChange={(e: any) => setTone(e.target.value)}
                >
                  {[
                    "Friendly",
                    "Professional",
                    "Urgent",
                    "Playful",
                    "Bold",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {ideas.map((h, i) => (
                <button
                  key={i}
                  className="text-left card p-2 hover:bg-zinc-50"
                  onClick={() => setLp((s) => ({ ...s, headline: h }))}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        <Card className="p-6 text-center relative overflow-hidden">
          {snapshot && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 65% 15%, ${
                  snapshot.theme || "#6D5DFF"
                }22, transparent 70%)`,
              }}
            />
          )}
          <div className="flex items-start justify-center gap-4">
            <h2
              className="text-3xl font-semibold tracking-tight"
              style={
                snapshot?.theme
                  ? {
                      backgroundImage: `linear-gradient(90deg, ${snapshot.theme}, rgba(145,107,245,0.9))`,
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }
                  : {}
              }
            >
              {viewModel.headline}
            </h2>
            {activeVariantData?.variant && (
              <span className="mt-1 inline-flex items-center h-6 px-2 rounded-md text-[11px] font-medium bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))]">
                Var: {activeVariantData.variant}
              </span>
            )}
          </div>
          <p className="mt-2 text-muted max-w-md mx-auto">{viewModel.sub}</p>
          <ul className="mt-4 inline-block text-left space-y-1">
            {viewModel.bullets.map((b, i) => (
              <li key={i} className="list-disc list-inside text-sm">
                {b}
              </li>
            ))}
          </ul>
          <Input
            placeholder="Enter your email"
            className="mt-6"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />
          <Button
            variant="primary"
            className="mt-3"
            style={
              snapshot?.theme
                ? {
                    backgroundImage: `linear-gradient(120deg, ${snapshot.theme}, rgba(145,107,245,0.95) 72%)`,
                  }
                : {}
            }
            onClick={() => {
              if (email) {
                setEmail("");
                incSignups(1, "user");
                toast("Signup captured", "success");
              }
            }}
          >
            {viewModel.cta}
          </Button>
          {variants.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px]">
              <span className="text-muted">Variants:</span>
              <button
                className={`px-2 py-1 rounded-md border text-xs ${
                  !activeVariantId || activeVariantId === snapshot?.id
                    ? "bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] border-[rgba(var(--accent),0.4)]"
                    : "border-subtle hover:bg-[rgba(var(--fg),0.04)]"
                }`}
                onClick={() => setActiveVariantId(snapshot?.id || null)}
              >
                Base
              </button>
              {variants.map((v) => (
                <button
                  key={v.id}
                  className={`px-2 py-1 rounded-md border text-xs ${
                    activeVariantId === v.id
                      ? "bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] border-[rgba(var(--accent),0.4)]"
                      : "border-subtle hover:bg-[rgba(var(--fg),0.04)]"
                  }`}
                  onClick={() => setActiveVariantId(v.id)}
                  title={v.data.headline}
                >
                  {v.variant || "Var"}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 text-[11px] text-muted">
            {snapshot
              ? dirty
                ? "Live version — newer draft pending republish"
                : "Live published version"
              : "Unpublished draft"}
          </div>
        </Card>

        {!snapshot && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button
              variant="subtle"
              onClick={() =>
                setLp((s) => ({ ...s, bullets: [...s.bullets, "New point"] }))
              }
            >
              + Bullet
            </Button>
            <Button
              variant="outline"
              onClick={() => setLp((s) => ({ ...s, cta: "Subscribe now" }))}
            >
              Try CTA variant
            </Button>
          </div>
        )}

        {/* Secondary block removed: single canonical live card retained */}
      </main>
      <OnboardingDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
      />
    </div>
  );
}
