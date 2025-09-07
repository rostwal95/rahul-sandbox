"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function NewPage() {
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const slugify = useCallback(
    (v: string) =>
      v
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    [],
  );
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) {
      setError("Slug required");
      return;
    }
    setCreating(true);
    setError(null);
    const finalSlug = slugify(slug);
    try {
      const r = await fetch("/api/app/pages", {
        method: "POST",
        body: JSON.stringify({ page: { org_id: 1, slug: finalSlug } }),
      });
      if (r.status === 201) {
        const page = await r.json();
        router.push(`/page/${page.id}/edit`);
        return;
      }
      let message = "Create failed";
      try {
        const j = await r.json();
        if (j?.errors?.length) message = j.errors.join(", ");
      } catch {}
      throw new Error(message);
    } catch (e: any) {
      setError(e.message);
      // Fire-and-forget client log (RUM/event ingestion) for debugging create failures
      try {
        fetch("/api/app/events", {
          method: "POST",
          body: JSON.stringify({
            event: {
              kind: "ui_error",
              scope: "page_create",
              message: e.message,
              slug: finalSlug,
              ts: Date.now(),
            },
          }),
        });
      } catch {}
    } finally {
      setCreating(false);
    }
  }
  return (
    <main className="mx-auto max-w-lg p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Page</h1>
      <form onSubmit={create} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="my-awesome-page"
            className="w-full rounded-md border px-3 py-2 text-sm"
            autoFocus
            aria-invalid={!!error}
          />
          <p className="text-[10px] text-zinc-500">
            Will be available at /p/{slug || "your-slug"}
          </p>
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button disabled={creating} className="btn btn-solid text-sm">
          {creating ? "Creating…" : "Create & Open Editor"}
        </button>
      </form>
    </main>
  );
}
