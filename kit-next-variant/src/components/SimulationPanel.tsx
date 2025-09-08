"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";

export default function SimulationPanel({
  sim,
  onStart1h,
  onStart24h,
  onStop,
  onLaunch,
  onStartCampaign,
  onResume,
  onPause,
  totalTicks,
  progressPct,
  showHeader = true,
}: {
  sim: { running: boolean; remaining: number; speed: number };
  onStart1h: () => void;
  onStart24h: () => void;
  onStop: () => void;
  onLaunch: () => void;
  onStartCampaign: () => void;
  onResume?: () => void;
  onPause?: () => void;
  totalTicks?: number;
  progressPct?: number;
  showHeader?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showHeader && (
          <div>
            <h3 className="font-medium">Dummy Traffic Simulation</h3>
            <p className="text-xs text-zinc-500">
              Generate realistic spikes for views → signups → emails to demo the
              funnel.
            </p>
          </div>
        )}
        {/* Idle or paused state */}
        {!sim.running ? (
          <div className="flex gap-2 flex-wrap">
            <Button variant="subtle" onClick={onStart1h}>
              Simulate 1h
            </Button>
            <Button variant="primary" onClick={onStart24h}>
              Simulate 24h
            </Button>
            <Button variant="secondary" onClick={onLaunch}>
              Launch campaign preset
            </Button>
            <Button variant="outline" onClick={onStartCampaign}>
              Simulate Campaign Launch
            </Button>
            {sim.remaining > 0 && onResume && (
              <Button variant="secondary" onClick={onResume}>
                Resume
              </Button>
            )}
            {sim.remaining > 0 && !sim.running && (
              <Tag>Paused: {sim.remaining} left</Tag>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Tag>Running: {sim.remaining} ticks left</Tag>
            {onPause && (
              <Button variant="outline" onClick={onPause}>
                Pause
              </Button>
            )}
            <Button variant="destructive" onClick={onStop}>
              Stop
            </Button>
          </div>
        )}
      </div>
      {totalTicks && totalTicks > 0 && (sim.running || sim.remaining > 0) && (
        <div className="mt-4">
          <div className="w-full h-2 rounded bg-[rgba(var(--fg),0.1)] overflow-hidden relative">
            <div
              className="h-full bg-[rgb(var(--accent))] transition-[width] duration-300 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, progressPct || 0))}%`,
              }}
            />
          </div>
          <div className="mt-1 text-[10px] text-muted flex items-center justify-between">
            <span>{Math.round(progressPct || 0)}% complete</span>
            <span>
              {Math.max(0, totalTicks - sim.remaining)} / {totalTicks} ticks
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
