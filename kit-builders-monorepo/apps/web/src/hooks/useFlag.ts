import useSWR from "swr";

export function useFlag(key: string) {
  const { data } = useSWR("/api/app/feature_flags", (u) =>
    fetch(u).then((r) => r.json()),
  );
  const list = Array.isArray(data) ? data : [];
  const ff = list.find((f: any) => f.key === key);
  return !!ff?.enabled;
}
