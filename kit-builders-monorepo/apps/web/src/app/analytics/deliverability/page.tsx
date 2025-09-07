"use client";
import useSWR from "swr";
import { useState } from "react";
import { SafeList } from "@/components/SafeList";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Deliverability() {
  const [segmentId, setSegmentId] = useState<string>("");
  const { data: series, error: seriesErr } = useSWR(
    `/api/app/metrics/deliverability_series${segmentId ? `?segment_id=${segmentId}` : ""}`,
    fetcher,
  );
  const { data: isp, error: ispErr } = useSWR(
    `/api/app/metrics/isp_breakdown${segmentId ? `?segment_id=${segmentId}` : ""}`,
    fetcher,
  );
  const { data: heat, error: heatErr } = useSWR(
    `/api/app/metrics/isp_heatmap${segmentId ? `?segment_id=${segmentId}` : ""}`,
    fetcher,
  );
  const { data: segments, error: segmentsErr } = useSWR(
    "/api/app/segments",
    fetcher,
  );

  return (
    <main className="mx-auto max-w-[1100px] p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Deliverability</h1>
      <div className="mt-2">
        <a className="btn btn-outline" href="/api/app/exports/analytics_series">
          Export CSV
        </a>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Segment</label>
        <select
          className="input w-64"
          value={segmentId}
          onChange={(e) => setSegmentId(e.target.value)}
        >
          <option value="">All contacts</option>
          <SafeList
            asOptions
            container="fragment"
            items={segments}
            loading={segments === undefined && !segmentsErr}
            error={segmentsErr}
            unexpectedLabel="Unexpected segments shape"
            render={(s: any) => <option value={s.id}>{s.name}</option>}
            keyFn={(s: any) => s.id}
            empty={
              <option disabled value="">
                No segments
              </option>
            }
          />
        </select>
      </div>

      <section className="card p-4">
        <div className="font-medium mb-2">Daily performance (last 14 days)</div>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <LineChart data={Array.isArray(series) ? series : []}>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <Legend />
              <Line type="monotone" dataKey="sent" />
              <Line type="monotone" dataKey="opened" />
              <Line type="monotone" dataKey="clicked" />
              <Line type="monotone" dataKey="bounced" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-4">
        <div className="font-medium mb-2">Top inbox providers</div>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <BarChart data={Array.isArray(isp) ? isp : []}>
              <XAxis dataKey="domain" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-4">
        <div className="font-medium mb-2">ISP engagement heatmap</div>
        <div className="overflow-x-auto">
          <table className="min-w-[500px] text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Domain</th>
                <th className="p-2">delivered</th>
                <th className="p-2">opened</th>
                <th className="p-2">clicked</th>
                <th className="p-2">bounced</th>
              </tr>
            </thead>
            <tbody>
              <SafeList
                row
                rowColSpan={5}
                items={
                  Array.isArray(heat)
                    ? heat
                    : Array.isArray((heat as any)?.rows)
                      ? (heat as any).rows
                      : heat
                }
                loading={heat === undefined && !heatErr}
                error={heatErr}
                unexpectedLabel="Unexpected heatmap shape"
                empty={
                  <tr>
                    <td colSpan={5} className="p-2 text-sm text-zinc-500">
                      No heatmap data
                    </td>
                  </tr>
                }
                render={(row: any) => {
                  const maxv = Math.max(
                    row.delivered || 0,
                    row.opened || 0,
                    row.clicked || 0,
                    row.bounced || 0,
                    1,
                  );
                  const cell = (v: number) => (
                    <td
                      className="p-2"
                      style={{
                        background: `rgba(16,185,129,${(v / maxv) * 0.3})`,
                      }}
                    >
                      {v || 0}
                    </td>
                  );
                  return (
                    <tr>
                      <td className="p-2">{row.domain}</td>
                      {cell(row.delivered)}
                      {cell(row.opened)}
                      {cell(row.clicked)}
                      {cell(row.bounced)}
                    </tr>
                  );
                }}
                keyFn={(row: any) =>
                  row.domain || row.id || JSON.stringify(row)
                }
              />
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
