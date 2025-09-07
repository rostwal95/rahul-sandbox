"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBroadcast() {
  const [subject, setSubject] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!subject) return;
    setCreating(true);
    setError(null);
    try {
      const r = await fetch("/api/app/broadcasts", {
        method: "POST",
        body: JSON.stringify({
          broadcast: {
            org_id: 1,
            subject,
            html: `<p>Hello subscribers!</p>`,
            status: "draft",
          },
        }),
      });
      if (!r.ok) throw new Error("Create failed");
      // Ideally redirect to broadcast detail if exists; fallback to list
      router.push("/broadcast");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }
  return (
    <main className="mx-auto max-w-lg p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New Broadcast</h1>
      <form onSubmit={create} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Weekly Update"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button disabled={creating} className="btn btn-solid text-sm">
          {creating ? "Creating…" : "Create Broadcast"}
        </button>
      </form>
    </main>
  );
}
