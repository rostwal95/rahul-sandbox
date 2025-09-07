"use client";
import * as React from "react";
import { Container } from "@kit/design-system";
import { Card } from "@/components/ui/Card";
import { track } from "@/lib/events";
import { OnboardingProgress } from "@/components/dashboard/ProgressChecklist";
import { ProductCard } from "@/components/dashboard/ProductCard";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CommandRoot,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import {
  FileText,
  Mail,
  LayoutDashboard,
  Users,
  ListChecks,
  Info,
  PanelsTopLeft,
} from "lucide-react";
import { HoverCard } from "@/components/ui/HoverCard";
import { DashboardSummary } from "./types";

export function DashboardClient({
  summary,
  series,
  meta,
  progressPct,
  loadError,
}: {
  summary?: DashboardSummary;
  series?: Record<string, number[]>;
  meta?: any;
  progressPct: number;
  loadError: string | null;
}) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  React.useEffect(() => {
    track("dashboard_opened");
  }, []);
  const isLoading = !summary && !loadError;
  return (
    <div className="relative">
      <Container
        className="relative max-w-[1240px] px-6 md:px-10 pt-8 md:pt-12 pb-16"
        size="xl"
      >
        <Header onOpenPalette={() => setPaletteOpen(true)} />
        <div className="mt-6 space-y-8 lg:space-y-10">
          <OnboardingProgress
            loading={isLoading}
            progressPct={progressPct}
            checklist={summary?.checklist}
          />
          {loadError && <ErrorBanner message={loadError} />}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 xl:gap-14 items-start">
            <div className="space-y-10">
              <WorkspaceSection />
              <PerformanceSection
                stats={summary?.stats}
                loading={isLoading}
                series={series}
              />
            </div>
            <aside className="space-y-10">
              <RightRailSearch onOpen={() => setPaletteOpen(true)} />
              <EngagementPanel loading={isLoading} items={summary?.recent} />
              {meta && <LatencyCard meta={meta} />}
            </aside>
          </div>
        </div>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </Container>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-rose-300/60 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800 px-4 py-3 text-sm flex items-center gap-2">
      <span className="font-semibold">Dashboard load failed:</span> {message}
    </div>
  );
}
function LatencyCard({ meta }: { meta: any }) {
  return (
    <Card className="p-4 text-[12px] space-y-2">
      <div className="text-[11px] font-medium tracking-wide text-[var(--muted)] uppercase">
        Diagnostics
      </div>
      <div className="flex justify-between">
        <span>Proxy</span>
        <span className="tabular-nums">{meta.proxy_ms} ms</span>
      </div>
      <div className="flex justify-between">
        <span>Upstream</span>
        <span className="tabular-nums">{meta.upstream_status}</span>
      </div>
      <div className="flex justify-between">
        <span>Series</span>
        <span className="tabular-nums">{meta.series_status}</span>
      </div>
      <div className="flex justify-between">
        <span>Generated</span>
        <span className="tabular-nums">
          {new Date(meta.generated_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
    </Card>
  );
}

function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [theme, setTheme] = React.useState<string | null>(null);
  React.useEffect(() => {
    const pref = localStorage.getItem("theme");
    const isDark = pref
      ? pref === "dark"
      : document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", isDark);
    setTheme(isDark ? "dark" : "light");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-[1.65rem] font-semibold tracking-tight scroll-mt-32">
            Dashboard
          </h1>
          <p className="text-[var(--fs-sm)] text-[var(--muted)] max-w-xl">
            Quiet overview of your workspace — tools, progress, key metrics &
            activity.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[12px] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_4%)] transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
      <div className="mt-6 h-px w-full bg-[linear-gradient(to_right,transparent,var(--border),transparent)]" />
    </div>
  );
}

function Tiles() {
  const tiles = [
    {
      title: "Landing Pages",
      icon: PanelsTopLeft,
      cta: "Open Studio",
      href: "/page",
    },
    {
      title: "Broadcasts",
      icon: Mail,
      cta: "New Broadcast",
      href: "/broadcast/new",
    },
    {
      title: "Sequences",
      icon: ListChecks,
      cta: "View Sequences",
      href: "/sequence",
    },
    { title: "Audience", icon: Users, cta: "View Audience", href: "/audience" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {tiles.map((t, i) => (
        <ProductCard key={t.title} {...t} idx={i} />
      ))}
    </div>
  );
}
function WorkspaceSection() {
  return (
    <section className="animate-in fade-in-20 duration-200">
      <Card className="p-6 space-y-5">
        <div className="text-[11px] font-medium tracking-wide text-[var(--muted)] uppercase">
          Your Tools
        </div>
        <Tiles />
      </Card>
    </section>
  );
}

function PerformanceSection({
  stats,
  loading,
  series,
}: {
  stats?: DashboardSummary["stats"];
  loading: boolean;
  series?: Record<string, number[]>;
}) {
  const base = [
    {
      key: "subscribers",
      label: "Subscribers",
      tip: "Total active subscribers.",
      format: (v: number) => Math.round(v).toLocaleString(),
    },
    {
      key: "avg_open",
      label: "Avg Open Rate",
      tip: "Average open rate (last 10 sends).",
      format: (v: number) => (v * 100).toFixed(1) + "%",
    },
    {
      key: "deliverability",
      label: "Deliverability",
      tip: "Accepted vs bounced ratio (30d).",
      format: (v: number) => (v * 100).toFixed(1) + "%",
    },
    {
      key: "active_flags",
      label: "Active Flags",
      tip: "Feature flags enabled.",
      format: (v: number) => String(Math.round(v)),
    },
  ];
  function computeDelta(key: string, vals?: number[]) {
    if (!vals || vals.length < 2) return { delta: 0, label: "—" };
    const last = vals.at(-1)!;
    const prev = vals.at(-2)!;
    const diff = last - prev;
    if (key === "avg_open" || key === "deliverability") {
      const pp = diff * 100;
      if (Math.abs(pp) < 0.05) return { delta: 0, label: "steady" };
      return { delta: pp, label: (pp > 0 ? "+" : "") + pp.toFixed(1) + "pp" };
    }
    if (diff === 0) return { delta: 0, label: "steady" };
    return {
      delta: diff,
      label: (diff > 0 ? "+" : "") + diff.toLocaleString(),
    };
  }
  const metrics = base.map((m) => {
    const raw = (stats as any)?.[m.key];
    const vals = series?.[m.key];
    const lastVal = vals?.at(-1);
    const value = typeof raw === "number" ? raw : (lastVal ?? 0);
    const { delta, label } = computeDelta(m.key, vals);
    const state: "up" | "down" | "steady" =
      delta > 0 ? "up" : delta < 0 ? "down" : "steady";
    return { ...m, value, delta, deltaLabel: label, state };
  });
  return (
    <section className="animate-in fade-in-20 duration-200" aria-live="polite">
      <Card className="p-6 overflow-visible">
        <div className="mb-4 text-[11px] font-medium tracking-wide text-[var(--muted)] uppercase">
          Key Metrics
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div
              key={m.key}
              style={{ animationDelay: `${i * 40}ms` }}
              className="group relative rounded-md border border-[var(--border)] bg-[var(--card)]/80 hover:bg-[color-mix(in_srgb,var(--card),var(--ink)_4%)] transition-colors p-3 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wide font-medium text-[var(--muted)] uppercase">
                  {m.label}
                </span>
                <HoverMetricInfo tip={m.tip} label={m.label} />
              </div>
              <div className="text-[1.35rem] leading-none font-semibold tabular-nums tracking-tight text-[var(--ink)]">
                {loading ? (
                  <span className="inline-block h-6 w-14 bg-zinc-200/70 rounded animate-pulse" />
                ) : (
                  m.format(m.value)
                )}
              </div>
              <div className="text-[11px] tabular-nums font-medium flex items-center gap-1">
                <DeltaBadge state={m.state} label={m.deltaLabel} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
function DeltaBadge({
  state,
  label,
}: {
  state: "up" | "down" | "steady" | string;
  label: string;
}) {
  const base =
    "px-1.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1";
  if (label === "—")
    return (
      <span className={base + " bg-[var(--border)]/40 text-[var(--muted)]"}>
        —
      </span>
    );
  if (state === "steady")
    return (
      <span className={base + " bg-[var(--border)]/40 text-[var(--muted)]"}>
        {label}
      </span>
    );
  const color =
    state === "up"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
  const arrow = state === "up" ? "▲" : "▼";
  return (
    <span className={base + " " + color}>
      {arrow} {label}
    </span>
  );
}
let firstMetricHintShown = false;
function HoverMetricInfo({ tip, label }: { tip: string; label: string }) {
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => {
    if (!firstMetricHintShown) {
      setPulse(true);
      firstMetricHintShown = true;
      const t = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(t);
    }
  }, []);
  return (
    <HoverCard
      trigger={
        <button
          aria-label={`${label} info`}
          type="button"
          className={
            "inline-flex items-center justify-center size-5 rounded-md text-[10px] font-semibold bg-[var(--bg)] border border-[var(--border)] transition-colors " +
            (pulse
              ? "animate-pulse text-emerald-600 border-emerald-500/60"
              : "text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30")
          }
        >
          <Info className="size-3" />
        </button>
      }
    >
      <div className="max-w-[240px] text-[12px] leading-snug">
        <span className="font-semibold text-[var(--ink)]">{label}:</span> {tip}
      </div>
    </HoverCard>
  );
}

function EngagementPanel({
  loading,
  items,
}: {
  loading: boolean;
  items?: DashboardSummary["recent"];
}) {
  const truncated = items?.slice(0, 5) || [];
  const tips = [
    { id: "ab", text: "Test an A/B hero: headline vs social proof." },
    { id: "dkim", text: "Add DKIM to improve trust & deliverability." },
    { id: "slash", text: "Use the / menu in the editor for fast blocks." },
  ];
  return (
    <Card className="p-5 space-y-5 animate-in fade-in-20 duration-200">
      <div className="text-[11px] font-medium tracking-wide text-[var(--muted)] uppercase">
        Activity & Tips
      </div>
      <div className="space-y-3 text-[13px]">
        {loading && (
          <div className="h-5 w-40 bg-zinc-200 rounded animate-pulse" />
        )}
        {!loading && truncated.length === 0 && (
          <div className="text-[var(--muted)]">No activity yet.</div>
        )}
        {!loading &&
          truncated.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3">
              <div className="flex-1 text-[var(--ink)] truncate">{r.title}</div>
              <time className="text-[11px] text-[var(--muted)] whitespace-nowrap tabular-nums">
                {new Date(r.at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          ))}
      </div>
      <div className="h-px w-full bg-[linear-gradient(to_right,transparent,var(--border),transparent)]" />
      <ul className="space-y-2 list-disc pl-4 text-[13px]">
        {tips.map((t) => (
          <li key={t.id} className="leading-snug text-[var(--ink)]/90">
            {t.text}
          </li>
        ))}
      </ul>
    </Card>
  );
}
function RightRailSearch({ onOpen }: { onOpen: () => void }) {
  return (
    <Card className="p-4 flex items-center justify-between gap-3 text-[13px]">
      <div className="flex flex-col">
        <span className="text-[11px] font-medium tracking-wide text-[var(--muted)] uppercase">
          Search / Jump
        </span>
        <span className="text-[var(--muted)]">Press ⌘K anytime</span>
      </div>
      <button
        onClick={() => {
          track("command_palette_open");
          onOpen();
        }}
        className="h-8 px-3 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[12px] text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--bg),var(--ink)_5%)] transition-colors font-medium"
      >
        Open
      </button>
    </Card>
  );
}

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      if (!e.metaKey && !e.ctrlKey && e.key === "g") {
        showNavHint();
        const next = (ev: KeyboardEvent) => {
          const map: Record<string, string> = {
            p: "/page",
            b: "/broadcast",
            a: "/audience",
          };
          const dest = map[ev.key];
          if (dest) window.location.assign(dest);
          window.removeEventListener("keydown", next, true);
        };
        window.addEventListener("keydown", next, true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);
  const [recent, setRecent] = React.useState<
    { label: string; href: string; icon: any }[]
  >([]);
  const [rawQuery, setRawQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setTimeout(() => setQuery(rawQuery), 120);
    return () => clearTimeout(id);
  }, [rawQuery]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("cmd_recent");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);
  const saveRecent = (item: { label: string; href: string; icon: any }) => {
    setRecent((prev) => {
      const next = [item, ...prev.filter((p) => p.href !== item.href)].slice(
        0,
        5,
      );
      try {
        localStorage.setItem("cmd_recent", JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const commands = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Pages", icon: FileText, href: "/page" },
    { label: "Broadcasts", icon: Mail, href: "/broadcast" },
    { label: "Audience", icon: Users, href: "/audience" },
    { label: "Sequences", icon: ListChecks, href: "/sequence" },
  ];
  const actions = [
    { label: "Create Page", icon: FileText, href: "/page/new" },
    { label: "New Broadcast", icon: Mail, href: "/broadcast/new" },
  ];
  const all = [...commands, ...actions];
  const filtered = query
    ? all
        .map((c) => ({ c, score: fuzzyScore(query, c.label) }))
        .filter((r) => r.score > -1)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.c)
    : commands;
  React.useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIdx];
      if (item) select(item);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }
  function select(c: { label: string; href: string; icon: any }) {
    track("command_navigate", { to: c.href, q: query });
    saveRecent(c);
    window.location.assign(c.href);
    onOpenChange(false);
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in-20" />
        <Dialog.Content className="fixed z-50 top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl">
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search and run navigation or creation commands.
          </Dialog.Description>
          <div className="card p-0 overflow-hidden animate-in zoom-in-95">
            <CommandRoot>
              <div className="border-b border-[var(--border)] px-3 py-2">
                <input
                  autoFocus
                  value={rawQuery}
                  onChange={(e) => setRawQuery(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search… (g then p / b / a to jump)"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-[var(--muted)]"
                />
              </div>
              <CommandList>
                {recent.length > 0 && !query && (
                  <CommandGroup heading="Recent">
                    {recent.map((r) => (
                      <CommandItem
                        key={r.href}
                        onSelect={() => select(r)}
                        className="flex items-center gap-2"
                      >
                        <r.icon className="size-4 text-[var(--muted)]" />
                        <span>{r.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandGroup heading="Navigate">
                  {filtered.map((c, idx) => (
                    <CommandItem
                      key={c.href}
                      onSelect={() => select(c)}
                      className={
                        "flex items-center gap-2 " +
                        (idx === activeIdx
                          ? "bg-[var(--bg)]/70 outline outline-1 outline-[var(--border)]"
                          : "")
                      }
                    >
                      <c.icon className="size-4 text-[var(--muted)]" />
                      <span>{highlightMatch(c.label, query)}</span>
                    </CommandItem>
                  ))}
                  {filtered.length === 0 && (
                    <div className="px-3 py-6 text-[12px] text-[var(--muted)]">
                      No matches
                    </div>
                  )}
                </CommandGroup>
                {!query && (
                  <CommandGroup heading="Actions">
                    {actions.map((a) => (
                      <CommandItem
                        key={a.href}
                        onSelect={() => select(a)}
                        className="flex items-center gap-2"
                      >
                        <a.icon className="size-4 text-emerald-600" />
                        <span>{a.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </CommandRoot>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// nav hint toast for 'g'
let gToast: HTMLElement | null = null;
function showNavHint() {
  if (gToast) {
    gToast.remove();
    gToast = null;
  }
  gToast = document.createElement("div");
  gToast.className =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-xs font-medium shadow";
  gToast.textContent = "g → p pages · b broadcasts · a audience";
  document.body.appendChild(gToast);
  setTimeout(() => {
    if (!gToast) return;
    gToast.style.transition = "opacity 300ms";
    gToast.style.opacity = "0";
    setTimeout(() => {
      gToast && gToast.remove();
      gToast = null;
    }, 320);
  }, 2400);
}

// fuzzy utils
function fuzzyScore(query: string, text: string) {
  query = query.trim().toLowerCase();
  if (!query) return 0;
  text = text.toLowerCase();
  let score = 0,
    qi = 0,
    streak = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) {
    if (text[i] === query[qi]) {
      score += 5 + streak * 2;
      qi++;
      streak++;
    } else streak = 0;
  }
  if (qi < query.length) return -1;
  return score - text.length * 0.1;
}
function highlightMatch(label: string, query: string) {
  if (!query) return label;
  const lower = label.toLowerCase();
  let qi = 0;
  const q = query.toLowerCase();
  const out: React.ReactNode[] = [];
  let buf = "";
  for (let i = 0; i < label.length; i++) {
    const ch = label[i];
    if (qi < q.length && lower[i] === q[qi]) {
      if (buf) {
        out.push(<span key={i + "b"}>{buf}</span>);
        buf = "";
      }
      out.push(
        <span key={i} className="text-emerald-600 font-semibold">
          {ch}
        </span>,
      );
      qi++;
    } else buf += ch;
  }
  if (buf) out.push(<span key="tail">{buf}</span>);
  return out;
}
