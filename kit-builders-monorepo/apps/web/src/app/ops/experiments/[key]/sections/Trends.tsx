"use client";
import useSWR from "swr";
import { useParams, useSearchParams } from "next/navigation";
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

export default function Trends() {
  const params = useParams<{ key: string }>();
  const sp = useSearchParams();
  const slug = sp.get("slug") || "";
  const { data } = useSWR(
    `/api/app/experiments/series?key=${params.key}${
      slug ? `&slug=${slug}` : ""
    }&days=21`,
    fetcher
  );
  type VariantsMap = Record<string, { signups?: number }>;
  const variants: string[] = Array.from(
    new Set(
      (data || []).flatMap((d: any) =>
        Object.keys((d.variants as VariantsMap) || {})
      )
    )
  ) as string[];
  const chart = (data || []).map((d: any) => {
    const row: Record<string, any> = { date: d.date };
    const vm: VariantsMap = (d.variants || {}) as VariantsMap;
    variants.forEach((v) => {
      const b = vm[v] || {};
      row[`${v}_signups`] = b.signups || 0;
    });
    return row;
  });
  return (
    <section className="card p-4 mt-6">
      <div className="font-medium mb-2">Trends (signups per variant)</div>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <LineChart data={chart}>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(v).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
            <Legend />
            {variants.map((v: string) => (
              <Line
                key={v as string}
                type="monotone"
                dataKey={`${v}_signups`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
