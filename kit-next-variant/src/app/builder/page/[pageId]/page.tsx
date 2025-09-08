"use client";

import TopBar from "@/components/TopBar";
import OnboardingDrawer from "@/components/OnboardingDrawer";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Check, Eye, Rocket, X, History, Copy, Undo2 } from "lucide-react";
import { toast } from "@/components/ToastHost";
import Sparkline from "@/components/Sparkline";

/* Templates */
const LP_TEMPLATES = [
  {
    id: "creator",
    name: "Creator Newsletter",
    headline: "Join my newsletter",
    sub: "Weekly insights on building and launching.",
    bullets: ["Actionable tips", "Behind-the-scenes", "Curated links"],
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
    sub: "Get the 28-page guide + templates direct to your inbox.",
    bullets: ["7 proven levers", "Plug-and-play templates", "Bonus checklist"],
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
  const t =
    tone === "Urgent"
      ? "Now live:"
      : tone === "Bold"
      ? "Big:"
      : tone === "Playful"
      ? "Psst:"
      : "New:";
  return [
    `Join the journey: ${topic}`,
    `Get ${value} with ${topic}`,
    `Inside: how we’re building ${topic}`,
    `${t} ${topic}`,
    `From idea to launch: ${topic}`,
  ];
}

export default function LandingBuilder() {
  /* App store selectors */
  const hasPublished = useAppStore((s) => s.hasPublished);
  const publishedSnapshot = useAppStore((s) => s.publishedSnapshot);
  const publishSnapshot = useAppStore((s) => s.publishSnapshot);
  const republishSnapshot = useAppStore((s) => s.republishSnapshot);
  const incViews = useAppStore((s) => s.incViews);
  const goals = useAppStore((s) => s.goals);
  const snapshotHistory = useAppStore((s) => s.snapshotHistory) || [];
  const rollbackSnapshot = useAppStore((s) => s.rollbackSnapshot);
  const funnel = useAppStore((s) => s.funnel);
  const trends = useAppStore((s) => s.trends);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [lp, setLp] = useState({
    headline: "Join my newsletter",
    sub: "Weekly insights",
    bullets: ["Tips", "Stories", "Links"],
    cta: "Subscribe",
    theme: "#6D5DFF",
  });
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [showTemplates, setShowTemplates] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [variant, setVariant] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  /* persist draft */
  useEffect(() => {
    try {
      localStorage.setItem("kit_draft_page", JSON.stringify(lp));
    } catch {}
  }, [lp]);
  useEffect(() => {
    try {
      const s = localStorage.getItem("kit_draft_page");
      if (s) setLp(JSON.parse(s));
    } catch {}
  }, []);

  /* copy deck controls */
  const [topic, setTopic] = useState("your project");
  const [benefit, setBenefit] = useState("better results");
  const [tone, setTone] = useState("Friendly");
  const ideas = useMemo(
    () => genHeadlines(topic, benefit, tone),
    [topic, benefit, tone]
  );

  /* helpers */
  const removeBullet = (i: number) =>
    setLp((s) => ({ ...s, bullets: s.bullets.filter((_, idx) => idx !== i) }));
  const addBullet = () =>
    setLp((s) => ({ ...s, bullets: [...s.bullets, "New point"] }));

  const theme = lp.theme;

  const PALETTE = [
    "#6D5DFF", // violet base
    "#6366F1",
    "#0EA5E9",
    "#14B8A6",
    "#F59E0B",
    "#EC4899",
    "#10B981",
    "#F43F5E",
  ];

  const spring = {
    type: "spring",
    stiffness: 420,
    damping: 32,
    mass: 0.7,
  } as const;

  /* Handlers */
  const handlePreview = useCallback(() => {
    // Record a lightweight preview view (do not mark published)
    incViews(1, "preview");
    setShowPreview(true);
  }, [incViews]);

  const dirty = useMemo(() => {
    // If no snapshot exists yet, always treat as dirty so user can publish
    if (!publishedSnapshot) return true;
    const baseDiff =
      publishedSnapshot.headline !== lp.headline ||
      publishedSnapshot.sub !== lp.sub ||
      publishedSnapshot.cta !== lp.cta ||
      publishedSnapshot.theme !== lp.theme ||
      publishedSnapshot.bullets.join("|") !== lp.bullets.join("|");
    const variantDiff = (publishedSnapshot.variant || "") !== (variant || "");
    return baseDiff || variantDiff;
  }, [publishedSnapshot, lp, variant]);

  const hasSnapshot = !!publishedSnapshot;

  const handlePublish = useCallback(() => {
    if (!hasPublished) {
      publishSnapshot(
        {
          headline: lp.headline,
          sub: lp.sub,
          bullets: lp.bullets,
          cta: lp.cta,
          theme: lp.theme,
          variant: variant || undefined,
        },
        25
      );
      toast("Landing page published", "success");
    } else if (dirty) {
      republishSnapshot({
        headline: lp.headline,
        sub: lp.sub,
        bullets: lp.bullets,
        cta: lp.cta,
        theme: lp.theme,
        variant: variant || publishedSnapshot?.variant,
      });
      toast("Snapshot re-published", "success");
    } else return;
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 3500);
  }, [hasPublished, dirty, lp, publishSnapshot, republishSnapshot]);

  /* Close preview with ESC */
  useEffect(() => {
    if (!showPreview) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPreview(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [showPreview]);

  /* beforeunload if dirty */
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  /* diff computation */
  const diff = useMemo(() => {
    if (!publishedSnapshot)
      return [] as { field: string; prev: any; next: any }[];
    const rows: { field: string; prev: any; next: any }[] = [];
    const FIELDS: (keyof typeof lp)[] = [
      "headline",
      "sub",
      "cta",
      "theme",
      "bullets",
    ];
    FIELDS.forEach((f) => {
      const prev: any = (publishedSnapshot as any)[f];
      const next: any = (lp as any)[f];
      if (f === "bullets") {
        if (prev.join("|") !== next.join("|"))
          rows.push({ field: f, prev: prev.slice(), next: next.slice() });
      } else if (prev !== next) rows.push({ field: f, prev, next });
    });
    if (
      publishedSnapshot?.variant !== (variant || publishedSnapshot?.variant)
    ) {
      rows.push({
        field: "variant",
        prev: publishedSnapshot?.variant || "—",
        next: variant || "—",
      });
    }
    return rows;
  }, [publishedSnapshot, lp, variant]);

  const copyExport = async () => {
    try {
      const payload = {
        draft: lp,
        published: publishedSnapshot,
        history: snapshotHistory.slice(-10),
      };
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast("Export copied", "success");
    } catch {
      toast("Copy failed", "error");
    }
  };

  const handleRollback = (id: string) => {
    rollbackSnapshot(id);
    toast("Rolled back", "info");
  };

  return (
    <div>
      <TopBar onOpenOnboarding={() => setOnboardOpen(true)} />
      <main className="container-wide px-6 py-8 space-y-8">
        {/* Hero */}
        <section className="card p-6 md:p-7 surface-glow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-[28px] font-semibold gradient-text">
                Landing Page Builder
              </h1>
              <p className="text-sm text-muted mt-1">
                Compose, iterate, version, and A/B test conversion-focused
                landing pages.
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                className="tap flex items-center gap-1"
                onClick={handlePreview}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
              <Button
                size="sm"
                variant={showDiff ? "secondary" : "outline"}
                className="tap flex items-center gap-1"
                onClick={() => setShowDiff((s) => !s)}
                disabled={!dirty}
              >
                <History className="h-3.5 w-3.5" /> Diff
              </Button>
              <Button
                size="sm"
                variant={
                  dirty ? "primary" : hasSnapshot ? "outline" : "primary"
                }
                className={cn(
                  "tap flex items-center gap-1 relative overflow-hidden",
                  justPublished && "pointer-events-none",
                  dirty &&
                    hasSnapshot &&
                    "border-[rgba(var(--accent),0.55)] text-[rgb(var(--accent))]"
                )}
                onClick={handlePublish}
                disabled={hasSnapshot && !dirty}
              >
                {hasSnapshot ? (
                  dirty ? (
                    <>
                      <History className="h-3.5 w-3.5" /> Republish
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Published
                    </>
                  )
                ) : (
                  <>
                    <Rocket className="h-3.5 w-3.5" /> Publish
                  </>
                )}
                <AnimatePresence>
                  {justPublished && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                      }}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--accent),0.35),transparent_70%)]"
                    />
                  )}
                </AnimatePresence>
              </Button>
              <Button
                size="sm"
                variant={showHistory ? "secondary" : "outline"}
                className="tap"
                onClick={() => setShowHistory((s) => !s)}
                aria-pressed={showHistory}
              >
                History
              </Button>
              {hasPublished && (
                <a
                  href="/page"
                  className="text-xs text-[rgb(var(--accent))] underline hover:opacity-80 transition"
                >
                  View live →
                </a>
              )}
            </div>
          </div>
          {justPublished && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 text-xs font-medium inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))]"
            >
              <Check className="h-3 w-3" />{" "}
              {dirty ? "Snapshot re-published" : "Landing page published"} —
              goals updated
            </motion.div>
          )}
        </section>

        {/* Builder layout */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {/* Templates & Theme Row */}
            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="p-5 xl:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    Templates{" "}
                    <span className="hidden md:inline text-[10px] font-medium px-2 py-0.5 rounded-md bg-[rgba(var(--accent),0.12)] text-[rgb(var(--accent))]">
                      {activeTemplate ? "Change" : "Pick one"}
                    </span>
                  </h2>
                  <button
                    onClick={() => setShowTemplates((s) => !s)}
                    className="text-[11px] text-muted hover:text-foreground transition"
                  >
                    {showTemplates ? "Collapse" : "Expand"}
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {showTemplates && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                    >
                      {LP_TEMPLATES.map((t) => {
                        const active = activeTemplate === t.id;
                        return (
                          <motion.button
                            key={t.id}
                            layout
                            whileHover={{ y: -4 }}
                            whileTap={{ y: 0 }}
                            transition={spring}
                            onClick={() => {
                              setActiveTemplate(t.id);
                              setLp((s) => ({
                                ...s,
                                headline: t.headline,
                                sub: t.sub,
                                bullets: t.bullets,
                                cta: t.cta,
                              }));
                            }}
                            className={cn(
                              "relative text-left rounded-lg border p-3 bg-[rgb(var(--card))] shadow-soft/30 overflow-hidden",
                              "before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:bg-[radial-gradient(circle_at_65%_20%,rgba(var(--accent),0.25),transparent_70%)]",
                              active &&
                                "ring-2 ring-[rgba(var(--accent),0.55)] ring-offset-2 ring-offset-[rgb(var(--bg))] before:opacity-100",
                              !active && "hover:before:opacity-100"
                            )}
                          >
                            <div className="text-[10px] font-semibold tracking-wide uppercase text-[rgba(var(--muted),0.85)] mb-1">
                              {t.name}
                            </div>
                            <div className="text-xs font-medium leading-snug line-clamp-5">
                              {t.headline}
                            </div>
                            {active && (
                              <motion.span
                                layoutId="template-active-pill"
                                className="absolute top-1.5 right-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))]"
                              >
                                Active
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
              <Card className="p-5">
                <h2 className="text-sm font-semibold mb-2">Theme</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    aria-label="Theme color"
                    type="color"
                    className="w-10 h-10 rounded-md border border-subtle"
                    value={theme}
                    onChange={(e) =>
                      setLp((s) => ({ ...s, theme: e.target.value }))
                    }
                  />
                  <Input
                    value={theme}
                    onChange={(e: any) =>
                      setLp((s) => ({ ...s, theme: e.target.value }))
                    }
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        aria-label={`Set theme ${c}`}
                        onClick={() => setLp((s) => ({ ...s, theme: c }))}
                        className={cn(
                          "h-6 w-6 rounded-md border border-[rgba(var(--border),0.7)] tap transition",
                          c.toLowerCase() === theme.toLowerCase() &&
                            "ring-2 ring-[rgba(var(--accent),0.5)] ring-offset-1 ring-offset-[rgb(var(--bg))]"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted">Preview accent</span>
                </div>
              </Card>
            </div>

            {/* Content & Bullets */}
            <Card className="p-6 space-y-5">
              <h2 className="text-sm font-semibold">Content</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted">Headline</label>
                    <Input
                      value={lp.headline}
                      onChange={(e: any) =>
                        setLp((s) => ({ ...s, headline: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Subheadline</label>
                    <Input
                      value={lp.sub}
                      onChange={(e: any) =>
                        setLp((s) => ({ ...s, sub: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted">CTA</label>
                    <Input
                      value={lp.cta}
                      onChange={(e: any) =>
                        setLp((s) => ({ ...s, cta: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted">Variant</label>
                    <Input
                      value={variant}
                      onChange={(e: any) => setVariant(e.target.value)}
                      placeholder="A/B label (optional)"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted">Bullets</label>
                    <Button size="sm" variant="outline" onClick={addBullet}>
                      + Bullet
                    </Button>
                  </div>
                  <ul className="mt-3 space-y-2">
                    <AnimatePresence initial={false}>
                      {lp.bullets.map((b, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{
                            duration: 0.28,
                            ease: [0.22, 0.65, 0.3, 0.9],
                          }}
                          className="flex items-center gap-2"
                        >
                          {/* Allow bullet symbol to be selectable for easy copy */}
                          <span className="text-muted-2 select-text">•</span>
                          <Input
                            value={b}
                            onChange={(e: any) => {
                              const arr = [...lp.bullets];
                              arr[i] = e.target.value;
                              setLp((s) => ({ ...s, bullets: arr }));
                            }}
                          />
                          <button
                            className="toolbar-btn"
                            onClick={() => removeBullet(i)}
                          >
                            Del
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Headline ideas */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold">Headline Ideas</h2>
              <p className="text-xs text-muted mt-0.5">
                Tune inputs → tap to apply.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-xs text-muted">Topic</label>
                  <Input
                    value={topic}
                    onChange={(e: any) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Benefit</label>
                  <Input
                    value={benefit}
                    onChange={(e: any) => setBenefit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Tone</label>
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
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                <AnimatePresence initial={false}>
                  {ideas.map((h) => (
                    <motion.button
                      key={h}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 0.65, 0.3, 0.9],
                      }}
                      className="text-left card p-2 hover:translate-y-[-2px]"
                      onClick={() => setLp((s) => ({ ...s, headline: h }))}
                    >
                      {h}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
            {/* Analytics inside builder */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold mb-1">Live Analytics</h2>
              <p className="text-[11px] text-muted mb-4">
                Real-time funnel stats (simulated).
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-md bg-[rgba(var(--fg),0.04)] dark:bg-[rgba(var(--fg),0.06)]">
                  <div className="text-[10px] uppercase tracking-wide text-muted-2 mb-0.5">
                    Views
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {funnel.views}
                  </div>
                </div>
                <div className="p-2 rounded-md bg-[rgba(var(--fg),0.04)] dark:bg-[rgba(var(--fg),0.06)]">
                  <div className="text-[10px] uppercase tracking-wide text-muted-2 mb-0.5">
                    Signups
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {funnel.signups}
                  </div>
                </div>
                <div className="p-2 rounded-md bg-[rgba(var(--fg),0.04)] dark:bg-[rgba(var(--fg),0.06)]">
                  <div className="text-[10px] uppercase tracking-wide text-muted-2 mb-0.5">
                    Emails
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {funnel.emailsSent}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wide text-muted-2">
                    Views Trend
                  </span>
                  <span className="text-[10px] text-muted-2">
                    {trends.views.length} pts
                  </span>
                </div>
                <Sparkline
                  data={trends.views.slice(-24)}
                  width={260}
                  height={40}
                />
              </div>
              {funnel.views > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted">
                  <div>
                    <span className="font-medium text-foreground">
                      Signup Rate:
                    </span>{" "}
                    {(
                      (funnel.signups / Math.max(1, funnel.views)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      Email Rate:
                    </span>{" "}
                    {(
                      (funnel.emailsSent / Math.max(1, funnel.views)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              )}
            </Card>
            {showDiff && dirty && (
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Draft vs Live Diff</h2>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setShowDiff(false)}
                  >
                    Close
                  </Button>
                </div>
                {diff.length === 0 && (
                  <p className="text-xs text-muted">No differences detected.</p>
                )}
                {diff.length > 0 && (
                  <ul className="space-y-2 text-xs font-mono">
                    {diff.map((d) => (
                      <li
                        key={d.field}
                        className="rounded-md border border-[rgba(var(--border),0.5)] p-2 bg-[rgb(var(--bg-1))]"
                      >
                        <div className="font-semibold mb-1 text-[10px] uppercase tracking-wide">
                          {d.field}
                        </div>
                        {Array.isArray(d.prev) ? (
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <div className="text-[10px] text-muted-2 mb-0.5">
                                Prev
                              </div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {d.prev.map((v: string, i: number) => (
                                  <li
                                    key={i}
                                    className="text-red-400/80 line-through"
                                  >
                                    {v}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-2 mb-0.5">
                                Next
                              </div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {d.next.map((v: string, i: number) => (
                                  <li key={i} className="text-green-400/80">
                                    {v}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 text-[11px]">
                            <div className="line-through text-red-400/80 break-words whitespace-pre-wrap">
                              {String(d.prev)}
                            </div>
                            <div className="text-green-400/80 break-words whitespace-pre-wrap">
                              {String(d.next)}
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
            {showHistory && (
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Version History</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={copyExport}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" /> Export
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setShowHistory(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
                {snapshotHistory.length === 0 && (
                  <p className="text-xs text-muted">No snapshots yet.</p>
                )}
                <ul className="space-y-2 max-h-[260px] overflow-auto pr-1 text-xs">
                  {[...snapshotHistory]
                    .slice()
                    .reverse()
                    .map((s) => (
                      <li
                        key={s.id}
                        className="flex items-start justify-between gap-3 rounded-md border border-[rgba(var(--border),0.5)] p-2 bg-[rgb(var(--bg-1))]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {s.data.headline.slice(0, 60)}
                          </div>
                          <div className="text-[10px] text-muted-2 mt-0.5 flex items-center gap-2">
                            <span>{new Date(s.ts).toLocaleTimeString()}</span>
                            {s.variant && (
                              <span className="px-1.5 py-0.5 rounded-sm bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] text-[9px] uppercase tracking-wide">
                                {s.variant}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleRollback(s.id)}
                            className="flex items-center gap-1"
                          >
                            <Undo2 className="h-3 w-3" /> Rollback
                          </Button>
                        </div>
                      </li>
                    ))}
                </ul>
              </Card>
            )}
          </div>

          <Card className="p-8 lg:sticky lg:top-[84px] h-fit text-center relative overflow-hidden">
            {/* Removed mix-blend overlay to prevent washed out text in dark mode; using normal radial fade */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at 70% 15%, ${theme}26, transparent 72%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
            />
            <motion.h2
              key={lp.headline}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 0.65, 0.3, 0.9] }}
              className="text-2xl font-semibold tracking-tight"
              style={{
                backgroundImage: `linear-gradient(90deg, ${theme}, rgba(145,107,245,0.9))`,
                WebkitBackgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
              }}
            >
              {lp.headline}
            </motion.h2>
            <motion.p
              key={lp.sub}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.05,
                ease: [0.22, 0.65, 0.3, 0.9],
              }}
              className="mt-1 text-muted max-w-md mx-auto"
            >
              {lp.sub}
            </motion.p>
            <ul className="mt-3 inline-block text-left">
              <AnimatePresence initial={false}>
                {lp.bullets.map((b, i) => (
                  <motion.li
                    key={b + i}
                    className="list-disc list-inside text-sm"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 0.65, 0.3, 0.9],
                      delay: i * 0.04,
                    }}
                  >
                    {b}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <Input
              placeholder="Enter your email"
              className="mt-5"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <Button
                variant="primary"
                className="mt-3 shadow-soft"
                style={{
                  backgroundImage: `linear-gradient(120deg, ${theme}, rgba(145,107,245,0.95) 72%)`,
                }}
                onClick={() => {
                  if (email) {
                    setEmail("");
                    toast("Signup captured", "success");
                  }
                }}
              >
                {lp.cta}
              </Button>
            </motion.div>
            <div className="mt-3 text-[11px] text-muted flex flex-col items-center gap-1">
              {!hasPublished ? (
                <span>Preview only — click Publish to seed views</span>
              ) : dirty ? (
                <span className="text-[rgb(var(--accent))] font-medium">
                  Draft changes — republish to update live
                </span>
              ) : (
                <span className="text-[rgb(var(--accent))] font-medium">
                  Published ✓ — capturing views & goals
                </span>
              )}
              {goals.published && (
                <span className="text-[10px] uppercase tracking-wide text-muted-2">
                  Goal: Publish completed
                </span>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Floating preview overlay */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 backdrop-blur-sm bg-[rgba(0,0,0,0.45)]"
              onClick={() => setShowPreview(false)}
            />
            <motion.div
              initial={{ y: 24, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="relative w-full max-w-2xl rounded-xl border border-[rgba(var(--border),0.5)] shadow-2xl overflow-hidden bg-[rgb(var(--card))]"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 65% 20%, ${theme}33, transparent 70%)`,
                }}
              />
              <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(var(--border),0.6)] bg-[rgba(var(--bg-1),0.7)] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
                  <Eye className="h-3.5 w-3.5" /> Live Preview
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant={
                      hasPublished ? (dirty ? "primary" : "outline") : "primary"
                    }
                    onClick={handlePublish}
                    disabled={hasPublished && !dirty}
                  >
                    {hasPublished
                      ? dirty
                        ? "Republish"
                        : "Published"
                      : "Publish"}
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setShowPreview(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="px-8 py-10 text-center">
                <h2
                  className="text-3xl font-semibold tracking-tight mb-2"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${theme}, rgba(145,107,245,0.9))`,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {lp.headline}
                </h2>
                <p className="text-sm text-muted max-w-md mx-auto">{lp.sub}</p>
                <ul className="mt-4 inline-block text-left space-y-1">
                  {lp.bullets.map((b, i) => (
                    <li key={b + i} className="list-disc list-inside text-sm">
                      {b}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  className="mt-6"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${theme}, rgba(145,107,245,0.95) 72%)`,
                  }}
                  onClick={() => incViews(1, "preview")}
                >
                  {lp.cta}
                </Button>
                <div className="mt-3 text-[10px] text-muted">
                  {hasPublished ? "Published" : "Unpublished draft"}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OnboardingDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
      />
    </div>
  );
}
