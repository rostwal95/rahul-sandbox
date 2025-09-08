"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import OnboardingDrawer from "@/components/OnboardingDrawer";
import GoalsPanel from "@/components/GoalsPanel";
import EventLogPanel from "@/components/EventLogPanel";
import SimulationPanel from "@/components/SimulationPanel";
import SplashScreen from "@/components/SplashScreen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { toast } from "@/components/ToastHost";
import { useAppStore } from "@/lib/store";
import { safeParseJSON } from "@/lib/utils";

export default function DashboardPage() {
  const [onboardOpen, setOnboardOpen] = useState(false);
  const funnel = useAppStore((s) => s.funnel);
  const goals = useAppStore((s) => s.goals);
  const sim = useAppStore((s) => s.sim);
  const hasPublished = useAppStore((s) => s.hasPublished);
  const log = useAppStore((s) => s.log);
  const trends = useAppStore((s) => s.trends);
  const incViews = useAppStore((s) => s.incViews);
  const incSignups = useAppStore((s) => s.incSignups);
  const incEmailsSent = useAppStore((s) => s.incEmailsSent);
  const addLog = useAppStore((s) => s.addLog);
  const markPublished = useAppStore((s) => s.markPublished);
  const resetStore = useAppStore((s) => s.reset);
  const setSim = useAppStore((s) => s.setSim);

  const simTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const presetTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ---------- local sim speed (new) ---------- */
  const [simSpeed, setSimSpeed] = useState(250);

  useEffect(() => {
    try {
      const migrated = localStorage.getItem("kit_migrated_v2");
      if (migrated) return;
      const funnelOld = safeParseJSON(
        localStorage.getItem("kit_demo_funnel"),
        funnel
      );
      const goalsOld = safeParseJSON(
        localStorage.getItem("kit_demo_goals"),
        goals
      );
      const publishedOld = safeParseJSON(
        localStorage.getItem("kit_demo_hasPublished"),
        hasPublished
      );
      const logOld = safeParseJSON(localStorage.getItem("kit_demo_log"), log);
      const trendsOld = safeParseJSON(
        localStorage.getItem("kit_demo_trends"),
        trends
      );
      const simOld = safeParseJSON(localStorage.getItem("kit_demo_sim"), sim);
      if (log.length === 0 && funnel.views === 0) {
        useAppStore.setState({
          funnel: funnelOld,
          goals: goalsOld,
          hasPublished: publishedOld,
          log: logOld,
          trends: trendsOld,
          sim: simOld,
        });
      }
      localStorage.setItem("kit_migrated_v2", "1");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAllTimers = () => {
    if (simTimer.current) clearInterval(simTimer.current);
    presetTimers.current.forEach((id) => clearTimeout(id));
    simTimer.current = null;
    presetTimers.current = [];
  };

  const runTick = () => {
    const { sim: simState } = useAppStore.getState();
    const base = Math.floor(10 + Math.random() * 60);
    const spike =
      Math.random() < 0.15 ? Math.floor(60 + Math.random() * 120) : 0;
    const viewsToAdd = base + spike;
    incViews(viewsToAdd, "sim");
    const rate = 0.04 + Math.random() * 0.1;
    const signupsToAdd = Math.max(
      0,
      Math.round(viewsToAdd * rate * (Math.random() < 0.85 ? 1 : 2))
    );
    if (signupsToAdd) incSignups(signupsToAdd, "sim");
    if (Math.random() < 0.2) incEmailsSent(1, "sim");
    setSim({ remaining: Math.max(0, simState.remaining - 1) });
  };

  const startSim = (ticks: number, speed = simSpeed) => {
    if (simTimer.current) clearInterval(simTimer.current);
    setSim({ running: true, remaining: ticks, speed });
    (window as any).__simTotalTicks = ticks;
    addLog(`▶️ Simulation started (${ticks} ticks @ ${speed}ms)`);
    simTimer.current = setInterval(runTick, speed);
  };
  const resumeSim = () => {
    const current = useAppStore.getState().sim;
    if (current.running || current.remaining <= 0) return;
    if (simTimer.current) clearInterval(simTimer.current);
    setSim({
      running: true,
      remaining: current.remaining,
      speed: current.speed,
    });
    addLog(
      `▶️ Simulation resumed (${current.remaining} ticks @ ${current.speed}ms)`
    );
    simTimer.current = setInterval(runTick, current.speed);
  };
  const pauseSim = () => {
    const current = useAppStore.getState().sim;
    if (!current.running) return;
    if (simTimer.current) clearInterval(simTimer.current);
    simTimer.current = null;
    setSim({
      running: false,
      remaining: current.remaining,
      speed: current.speed,
    });
    addLog("⏸ Simulation paused");
  };
  const stopSim = () => {
    stopAllTimers();
    setSim({ running: false, remaining: 0 });
    addLog("⏸ Simulation stopped");
  };
  useEffect(() => {
    if (sim.running && sim.remaining <= 0) stopSim();
  }, [sim.running, sim.remaining]);
  useEffect(() => () => stopAllTimers(), []);

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    presetTimers.current.push(id);
  };
  const handlePublish = (seed = 25) => markPublished(seed);

  const launchCampaignPreset = () => {
    if (!hasPublished) {
      handlePublish(60);
      addLog("🚀 Campaign preset: auto-published landing page (+60 views)");
    } else {
      incViews(80, "sim");
      addLog("🚀 Campaign preset: kickoff traffic burst (+80 views)");
    }
    startSim(32);
    schedule(() => {
      incEmailsSent(1, "sim");
      addLog("📣 Campaign preset: broadcast sent (mid-simulation)");
    }, 16 * simSpeed);
    schedule(() => {
      incViews(150, "sim");
      incSignups(Math.round(150 * (0.08 + Math.random() * 0.06)), "sim");
      addLog("📈 Campaign preset: prime-time spike");
    }, 8 * simSpeed);
    schedule(() => {
      incViews(120, "sim");
      incSignups(Math.round(120 * (0.07 + Math.random() * 0.05)), "sim");
      addLog("📈 Campaign preset: evening spike");
    }, 24 * simSpeed);
  };

  const startCampaign = () => {
    if (!hasPublished) {
      handlePublish(40);
      addLog("🚀 Campaign: Landing page auto-published");
    }
    startSim(96);
    schedule(() => {
      incEmailsSent(1, "sim");
      addLog("📣 Campaign: Broadcast sent during simulation");
    }, (96 / 2) * simSpeed);
  };

  const pct = useMemo(() => {
    const views = Math.max(1, funnel.views);
    return {
      s: ((funnel.signups / views) * 100).toFixed(1),
      e: ((funnel.emailsSent / views) * 100).toFixed(1),
    };
  }, [funnel]);

  const resetDemo = () => {
    stopAllTimers();
    resetStore();
    try {
      localStorage.removeItem("kit_migrated_v2");
    } catch {}
  };

  const initialLoading =
    funnel.views === 0 && log.length === 0 && !hasPublished;

  return (
    <SplashScreen>
      <TopBar
        onOpenOnboarding={() => setOnboardOpen(true)}
        onReset={resetDemo}
      />
      <main className="container-wide px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="card p-6 md:p-7 surface-glow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-[28px] font-semibold gradient-text">
                Welcome, Creator
              </h1>
              <p className="text-sm text-muted mt-1">
                Ship broadcasts, automate newsletters, and grow your list —
                everything in one lightweight kit.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resetDemo();
                  toast("Demo reset", "info");
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => toast("Refreshed", "info")}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "Send Email",
                sub: "Broadcast to your audience.",
                href: "/builder/email/demo",
                emoji: "✉️",
              },
              {
                title: "Newsletter",
                sub: "Automate weekly sends.",
                href: "/builder/email/welcome",
                emoji: "🗞️",
              },
              {
                title: "Landing Page",
                sub: "Capture subscribers fast.",
                href: "/builder/page/demo",
                emoji: "🚀",
              },
            ].map((a) => (
              <a key={a.title} href={a.href} className="group">
                <Card className="p-4 h-full">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-xl2 p-3 accent-gradient shadow-soft">
                      {a.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-xs text-muted mt-0.5">{a.sub}</div>
                    </div>
                    <Button
                      className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                      size="sm"
                    >
                      Start
                    </Button>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Goals + Events */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 card p-0 overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-subtle">
              <h2 className="text-lg font-semibold">Focus & goals</h2>
              <p className="text-xs text-muted mt-0.5">
                Track what matters this week.
              </p>
            </div>
            <div className="p-5 select-text">
              <GoalsPanel goals={goals} loading={initialLoading} />
            </div>
          </div>
          <EventLogPanel
            log={log}
            loading={initialLoading}
            className="md:col-span-1 h-[400px]"
          />
        </section>

        {/* Simulation */}
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Dummy Traffic Simulation
              </h2>
              <p className="text-sm text-muted">
                Generate realistic spikes for views → signups → emails to demo
                the funnel.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted">Speed</label>
              <select
                className="input w-[120px]"
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseInt(e.target.value, 10))}
              >
                <option value={400}>Calm</option>
                <option value={250}>Normal</option>
                <option value={160}>Fast</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <SimulationPanel
              sim={{ ...sim, speed: simSpeed }}
              onStart1h={() => startSim(12)}
              onStart24h={() => startSim(96)}
              onStop={stopSim}
              onLaunch={launchCampaignPreset}
              onStartCampaign={startCampaign}
              onResume={resumeSim}
              onPause={pauseSim}
              totalTicks={
                (window as any).__simTotalTicks ||
                (sim.running ? sim.remaining : 0)
              }
              progressPct={(() => {
                const total = (window as any).__simTotalTicks || 0;
                if (!total) return 0;
                return ((total - sim.remaining) / total) * 100;
              })()}
              showHeader={false}
            />
          </div>
        </section>

        {/* Funnel */}
        <section className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Conversion Funnel</h2>
              <p className="text-sm text-muted">
                Last 30 days performance from page views → signups → emails sent
              </p>
            </div>
            {!hasPublished && (
              <a href="/builder/page/demo" className="md:self-start">
                <Button variant="primary">Create landing page</Button>
              </a>
            )}
          </div>

          {!hasPublished ? (
            <div className="panel p-8 border-dashed text-center bg-[rgba(var(--fg),0.015)] dark:bg-[rgba(var(--fg),0.08)]">
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Publish a landing page to begin collecting traffic, signups, and
                email sending metrics. This dashboard updates in real time as
                simulation or real events stream in.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Page Views"
                value={funnel.views}
                pct="100%"
                trend={trends.views}
                accent="primary"
                helper="Traffic captured"
              />
              <MetricCard
                label="Signups"
                value={funnel.signups}
                pct={`${pct.s}%`}
                trend={trends.signups}
                accent="accent"
                helper="Conversion vs views"
              />
              <MetricCard
                label="Emails Sent"
                value={funnel.emailsSent}
                pct={`${pct.e}%`}
                trend={trends.emails}
                accent="neutral"
                helper="Sent / views"
              />
            </div>
          )}
        </section>
      </main>

      <OnboardingDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
      />
    </SplashScreen>
  );
}
