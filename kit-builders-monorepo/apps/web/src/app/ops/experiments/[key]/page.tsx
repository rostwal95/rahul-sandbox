"use client";
import Trends from "./sections/Trends";
import Significance from "./sections/Significance";
import DeviceBreakdown from "./sections/DeviceBreakdown";
import AllocEditor from "./sections/AllocEditor";
import useSWR from "swr";
import { useParams, useSearchParams } from "next/navigation";
const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function ExperimentDetail() {
  const params = useParams<{ key: string }>();
  const sp = useSearchParams();
  const slug = sp.get("slug") || "";
  const { data } = useSWR(
    `/api/app/experiments/results?key=${params.key}${slug ? `&slug=${slug}` : ""}`,
    fetcher,
  );
  return (
    <main className="mx-auto max-w-[900px] p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Experiment: {params.key}</h1>
      {slug && <div className="text-sm text-zinc-600">Slug: {slug}</div>}
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Variant</th>
            <th className="text-right p-2">Assigned</th>
            <th className="text-right p-2">Clicks</th>
            <th className="text-right p-2">CTR</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map((r: any) => (
            <tr key={r.variant}>
              <td className="p-2">{r.variant}</td>
              <td className="p-2 text-right">{r.assigned}</td>
              <td className="p-2 text-right">{r.clicks}</td>
              <td className="p-2 text-right">{(r.ctr * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Trends />
      <Significance />
      <DeviceBreakdown />
      <AllocEditor />
    </main>
  );
}
