"use client";
import useSWR from "swr";
import { SafeList } from "@/components/SafeList";
const fetcher = (u: string) => fetch(u).then((r) => r.json());
export default function DeviceTable() {
  const { data, error } = useSWR("/api/app/rum/device_breakdown", fetcher);
  return (
    <div className="max-w-md">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Device</th>
            <th className="text-right p-2">Events</th>
          </tr>
        </thead>
        <tbody>
          <SafeList
            row
            rowColSpan={2}
            items={data}
            loading={data === undefined && !error}
            error={error}
            unexpectedLabel="Unexpected device breakdown shape"
            empty={
              <tr>
                <td colSpan={2} className="p-2 text-sm text-zinc-500">
                  No device data
                </td>
              </tr>
            }
            render={(r: any) => (
              <tr>
                <td className="p-2 capitalize">{r.device}</td>
                <td className="p-2 text-right">{r.count}</td>
              </tr>
            )}
            keyFn={(r: any) => r.device}
          />
        </tbody>
      </table>
    </div>
  );
}
