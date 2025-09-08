import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home(){
  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[720px] mx-auto text-center space-y-8">
        <div className="space-y-3">
          <span className="chip">Demo workspace</span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight gradient-text">Kit Builders Platform</h1>
          <p className="text-sm text-muted max-w-[560px] mx-auto leading-relaxed">
            Prototype your publishing stack: send broadcasts, build landing pages, run signup simulations & track funnel metrics.
          </p>
        </div>

        <Card className="p-6 md:p-7 backdrop-blur-sm bg-[rgba(var(--card),0.92)] border-[rgba(var(--border),0.75)] shadow-soft space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/dashboard" className="contents">
              <Button variant="primary" className="w-full">Open Dashboard</Button>
            </Link>
            <Link href="/builder/page/demo" className="contents">
              <Button variant="outline" className="w-full">Try Landing Page</Button>
            </Link>
          </div>
          <p className="text-[11px] text-muted">
            All data is local demo state. Refresh to simulate a net-new workspace.
          </p>
        </Card>
      </div>
    </main>
  );
}
