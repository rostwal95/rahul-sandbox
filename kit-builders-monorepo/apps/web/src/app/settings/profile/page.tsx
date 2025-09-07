"use client";
import { useState, useEffect } from "react";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/app/org");
        if (r.ok) {
          const j = await r.json();
          setName(j.name || "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/app/org", {
        method: "POST",
        body: JSON.stringify({ org: { name } }),
      });
      if (!r.ok) throw new Error("Save failed");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Org Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm bg-white"
            placeholder="Your organization"
          />
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button disabled={saving} className="btn btn-solid text-sm">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
      {loading && <div className="text-xs text-muted">Loading…</div>}
    </main>
  );
}
