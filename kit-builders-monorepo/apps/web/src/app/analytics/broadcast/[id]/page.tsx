"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
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

export default function BroadcastAnalytics() {
  const search =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const selUrl = search.get("url") || "";
  const params = useParams<{ id: string }>();
  const { data: series, error: seriesErr } = useSWR(
    `/api/app/metrics/broadcast_series?broadcast_id=${params.id}`,
    fetcher,
  );
  const { data: isp, error: ispErr } = useSWR(
    `/api/app/metrics/broadcast_isp_breakdown?broadcast_id=${params.id}`,
    fetcher,
  );
  const { data: links, error: linksErr } = useSWR(
    `/api/app/metrics/broadcast_links?broadcast_id=${params.id}`,
    fetcher,
  );
  const { data: cohorts, error: cohortsErr } = useSWR(
    `/api/app/metrics/broadcast_url_cohorts?broadcast_id=${params.id}`,
    fetcher,
  );
  const { data: doms, error: domsErr } = useSWR(
    `/api/app/metrics/broadcast_domain_engagement?broadcast_id=${params.id}`,
    fetcher,
  );

  return (
    <main className="mx-auto max-w-[1100px] p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Broadcast #{params.id} Analytics
      </h1>
      <div className="mt-2">
        <a
          className="btn btn-outline"
          href={`/api/app/exports/broadcast_clicks?broadcast_id=${params.id}`}
        >
          Export Clicks CSV
        </a>
      </div>
      <section className="card p-4">
        <div className="font-medium mb-2">Daily engagement</div>
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
            <BarChart data={isp || []}>
              <XAxis dataKey="domain" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="card p-4">
        <div className="font-medium mb-2">Top Links</div>
        <div className="text-sm text-zinc-600 mb-2">
          Funnel — Sent: {links?.sent ?? "—"} · Opened: {links?.opened ?? "—"} ·
          Clicked: {links?.clicked ?? "—"}
        </div>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">URL</th>
                <th className="text-right p-2">Clicks</th>
              </tr>
            </thead>
            <tbody>
              <SafeList
                row
                rowColSpan={2}
                items={links?.links}
                loading={links === undefined && !linksErr}
                error={linksErr}
                unexpectedLabel="Unexpected links shape"
                render={(r: any) => (
                  <tr
                    key={r.url}
                    className={selUrl && r.url === selUrl ? "bg-amber-50" : ""}
                  >
                    <td className="p-2 truncate max-w-[600px]">
                      <a className="underline" href={r.url} target="_blank">
                        {r.url}
                      </a>
                    </td>
                    <td className="p-2 text-right">{r.clicks}</td>
                  </tr>
                )}
                keyFn={(r: any) => r.url}
                empty={
                  <tr>
                    <td colSpan={2} className="p-2 text-sm text-zinc-500">
                      No links
                    </td>
                  </tr>
                }
              />
            </tbody>
          </table>
        </div>
      </section>
      <section className="card p-4">
        <div className="font-medium mb-2">Link Cohorts</div>
        <div className="text-sm text-zinc-600 mb-2">
          Unique clickers per URL, first-click attribution, and per-domain CTR
          (unique clickers / sent).
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="mb-1 text-sm font-medium">Per URL</div>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">URL</th>
                    <th className="p-2 text-right">Unique</th>
                    <th className="p-2 text-right">First</th>
                    <th className="p-2 text-right">Clicks</th>
                    <th className="p-2 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  <SafeList
                    row
                    rowColSpan={5}
                    items={cohorts?.links}
                    loading={cohorts === undefined && !cohortsErr}
                    error={cohortsErr}
                    unexpectedLabel="Unexpected cohorts links shape"
                    render={(r: any) => (
                      <tr>
                        <td className="p-2 truncate max-w-[420px]">
                          <a className="underline" href={r.url} target="_blank">
                            {r.url}
                          </a>
                        </td>
                        <td className="p-2 text-right">{r.unique_clickers}</td>
                        <td className="p-2 text-right">
                          {r.first_click_attributed}
                        </td>
                        <td className="p-2 text-right">{r.total_clicks}</td>
                        <td className="p-2 text-right">
                          {(r.ctr * 100).toFixed(2)}%
                        </td>
                      </tr>
                    )}
                    keyFn={(r: any) => r.url}
                    empty={
                      <tr>
                        <td colSpan={5} className="p-2 text-sm text-zinc-500">
                          No link cohorts
                        </td>
                      </tr>
                    }
                  />
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Per Domain</div>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Domain</th>
                    <th className="p-2 text-right">Unique</th>
                    <th className="p-2 text-right">Clicks</th>
                    <th className="p-2 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  <SafeList
                    row
                    rowColSpan={4}
                    items={cohorts?.domains}
                    loading={cohorts === undefined && !cohortsErr}
                    error={cohortsErr}
                    unexpectedLabel="Unexpected cohorts domains shape"
                    render={(r: any) => (
                      <tr>
                        <td className="p-2">{r.domain}</td>
                        <td className="p-2 text-right">{r.unique_clickers}</td>
                        <td className="p-2 text-right">{r.total_clicks}</td>
                        <td className="p-2 text-right">
                          {(r.ctr * 100).toFixed(2)}%
                        </td>
                      </tr>
                    )}
                    keyFn={(r: any) => r.domain}
                    empty={
                      <tr>
                        <td colSpan={4} className="p-2 text-sm text-zinc-500">
                          No domain cohorts
                        </td>
                      </tr>
                    }
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <section className="card p-4">
        <div className="font-medium mb-2">Domain Engagement</div>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Domain</th>
                <th className="p-2 text-right">Sent</th>
                <th className="p-2 text-right">Opened</th>
                <th className="p-2 text-right">Clicked</th>
                <th className="p-2 text-right">Bounced</th>
                <th className="p-2 text-right">Open%</th>
                <th className="p-2 text-right">Bounce%</th>
                <th className="p-2 text-right">Signal</th>
              </tr>
            </thead>
            <tbody>
              <SafeList
                row
                rowColSpan={8}
                items={doms}
                loading={doms === undefined && !domsErr}
                error={domsErr}
                unexpectedLabel="Unexpected domain engagement shape"
                render={(r: any) => (
                  <tr key={r.domain}>
                    <td className="p-2">{r.domain}</td>
                    <td className="p-2 text-right">{r.sent}</td>
                    <td className="p-2 text-right">{r.opened}</td>
                    <td className="p-2 text-right">{r.clicked}</td>
                    <td className="p-2 text-right">{r.bounced}</td>
                    <td className="p-2 text-right">
                      {(r.open_rate * 100).toFixed(1)}%
                    </td>
                    <td className="p-2 text-right">
                      {(r.bounce_rate * 100).toFixed(1)}%
                    </td>
                    <td className="p-2 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${r.signal === "green" ? "bg-emerald-100 text-emerald-700" : r.signal === "yellow" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                      >
                        {r.signal}
                      </span>
                    </td>
                  </tr>
                )}
                keyFn={(r: any) => r.domain}
                empty={
                  <tr>
                    <td colSpan={8} className="p-2 text-sm text-zinc-500">
                      No domains
                    </td>
                  </tr>
                }
              />
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
