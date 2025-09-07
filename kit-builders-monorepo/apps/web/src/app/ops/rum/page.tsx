"use client";
import DeviceTable from "./sections/DeviceTable";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function RUM() {
  const { data: series } = useSWR("/api/app/rum/series?days=30", fetcher);
  const { data: sum } = useSWR("/api/app/rum/summary", fetcher);
  return (
    <main className="mx-auto max-w-[1100px] p-6 space-y-6">
      <h1 className="text-2xl font-semibold">RUM Dashboard</h1>
      <section className="card p-4">
        <div className="font-medium mb-2">LCP / TTFB (p50/p95)</div>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <LineChart data={series || []}>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <Legend />
              <Line type="monotone" dataKey="lcp_p50" />
              <Line type="monotone" dataKey="lcp_p95" />
              <Line type="monotone" dataKey="ttfb_p50" />
              <Line type="monotone" dataKey="ttfb_p95" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="card p-4">
        <div className="font-medium mb-2">Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-zinc-500">Events</div>
            <div className="text-2xl">{sum?.count ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">LCP p50</div>
            <div className="text-2xl">{sum?.lcp?.p50 ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">LCP p95</div>
            <div className="text-2xl">{sum?.lcp?.p95 ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">TTFB p95</div>
            <div className="text-2xl">{sum?.ttfb?.p95 ?? "—"}</div>
          </div>
        </div>
      </section>
      <section className="card p-4">
        <div className="font-medium mb-2">Device breakdown</div>
        <DeviceTable />
      </section>
    </main>
  );
}
