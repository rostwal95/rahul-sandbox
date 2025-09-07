"use client";
import useSWR from "swr";
import Link from "next/link";
import React from "react";
import { useToast } from "@/components/ToastProvider";
import TemplatesGallery from "@/modules/page/TemplatesGallery";
import AppShell from "@/components/AppShell";
import { Container, Card, Skeleton } from "@kit/design-system";
import { useEffect } from "react";
import { track } from "@/lib/events";

function StatusBadge({
  status,
  hasExperiment,
}: {
  status?: string;
  hasExperiment?: boolean;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide";
  if (hasExperiment) {
    return (
      <span
        className={
          base + " bg-indigo-50 text-indigo-600 border border-indigo-200"
        }
      >
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Experiment
      </span>
    );
  }
  if (status === "published") {
    return (
      <span
        className={
          base + " bg-emerald-50 text-emerald-600 border border-emerald-200"
        }
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Published
      </span>
    );
  }
  return (
    <span
      className={base + " bg-amber-50 text-amber-600 border border-amber-200"}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Draft
    </span>
  );
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PagesList() {
  const { data, error, isLoading, mutate } = useSWR("/api/app/pages", fetcher);
  const [pendingDelete, setPendingDelete] = React.useState<
    Record<string, boolean>
  >({});
  const { push } = useToast();
  // Fire telemetry for list view & measure potential TTFP funnel entry
  useEffect(() => {
    track("lp_list_viewed");
  }, []);
  const createFromTemplate = async (tpl: any) => {
    const slug = prompt("Slug for new page?", tpl.id) || tpl.id;
    const r = await fetch("/api/app/pages", {
      method: "POST",
      body: JSON.stringify({ page: { org_id: 1, slug } }),
    });
    if (!r.ok) return;
    const page = await r.json();
    // create blocks
    for (let i = 0; i < tpl.blocks.length; i++) {
      const b = tpl.blocks[i];
      await fetch(`/api/app/pages/${page.id}/blocks`, {
        method: "POST",
        body: JSON.stringify({
          block: { kind: b.kind, order: i, data_json: b.data_json },
        }),
      });
    }
    mutate();
  };

  return (
    <AppShell>
      <Container size="xl" className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Landing Pages
          </h1>
          <Link href="/page/new" className="btn btn-solid text-sm">
            New Page
          </Link>
        </div>
        <section className="space-y-4">
          <div>
            <h2 className="font-medium">Start from a template</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Pick a template. You can change blocks later.
            </p>
          </div>
          <div className="flex items-center justify-end">
            <button
              className="btn btn-outline"
              onClick={async () => {
                const brief = prompt(
                  "Describe your page",
                  "AI tools newsletter for creators",
                );
                if (!brief) return;
                const resp = await fetch("/api/ai/page", {
                  method: "POST",
                  body: JSON.stringify({ brief }),
                });
                const j = await resp.json();
                const slug =
                  prompt("Slug for new page?", "ai-page") || "ai-page";
                const r = await fetch("/api/app/pages", {
                  method: "POST",
                  body: JSON.stringify({ page: { org_id: 1, slug } }),
                });
                if (!r.ok) return;
                const page = await r.json();
                for (let i = 0; i < j.blocks.length; i++) {
                  const b = j.blocks[i];
                  await fetch(`/api/app/pages/${page.id}/blocks`, {
                    method: "POST",
                    body: JSON.stringify({
                      block: {
                        kind: b.kind || "custom",
                        order: i,
                        data_json: b.html ? { html: b.html } : { data: b.data },
                      },
                    }),
                  });
                }
                location.href = `/page/${page.id}/edit`;
              }}
            >
              Generate page with AI
            </button>
          </div>
          <TemplatesGallery onPick={createFromTemplate} />
        </section>
        <section>
          <div className="grid gap-3">
            {error && (
              <div className="text-sm text-red-600">Failed to load pages.</div>
            )}
            {isLoading && !data && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </Card>
                ))}
              </>
            )}
            {Array.isArray(data) && data.length === 0 && !isLoading && (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-zinc-600">
                No pages yet — start from a template above or
                <button
                  className="ml-1 underline"
                  onClick={() => {
                    const slug = prompt("Slug for new blank page?", "new-page");
                    if (!slug) return;
                    fetch("/api/app/pages", {
                      method: "POST",
                      body: JSON.stringify({ page: { org_id: 1, slug } }),
                    })
                      .then((r) => r.json())
                      .then((p) => (location.href = `/page/${p.id}/edit`));
                  }}
                >
                  create a blank one
                </button>
                .
              </div>
            )}
            {Array.isArray(data) &&
              data.map((p: any) => (
                <Card
                  key={p.id}
                  className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{p.slug}</div>
                      <StatusBadge
                        status={p.status}
                        hasExperiment={p.has_experiment}
                      />
                    </div>
                    <div className="text-xs text-zinc-500 flex flex-wrap gap-3">
                      {p.updated_at && (
                        <span>
                          Updated {new Date(p.updated_at).toLocaleDateString()}
                        </span>
                      )}
                      {typeof p.subscribers_last7 === "number" && (
                        <span>{p.subscribers_last7} subs (7d)</span>
                      )}
                      {typeof p.conv_rate === "number" && (
                        <span>Conv {Math.round(p.conv_rate * 100)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/page/${p.id}/edit`}
                      className="btn btn-outline text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-outline text-xs disabled:opacity-50"
                      disabled={!!pendingDelete[p.id]}
                      onClick={async () => {
                        if (pendingDelete[p.id]) return; // guard double click
                        if (
                          !confirm("Delete this page? This cannot be undone.")
                        )
                          return;
                        // optimistic update
                        setPendingDelete((s) => ({ ...s, [p.id]: true }));
                        const previous = data;
                        mutate(
                          (current: any) =>
                            Array.isArray(current)
                              ? current.filter((pg: any) => pg.id !== p.id)
                              : current,
                          false,
                        );
                        try {
                          const res = await fetch(`/api/app/pages/${p.id}`, {
                            method: "DELETE",
                          });
                          const status = res.status;
                          const success =
                            [200, 202, 204].includes(status) || status === 404;
                          if (success) {
                            // If backend returned 404 but item already gone in UI treat as idempotent success
                            mutate();
                            push({
                              variant: "success",
                              title:
                                status === 404 ? "Already deleted" : "Deleted",
                              message:
                                status === 404
                                  ? `${p.slug} was already removed.`
                                  : `${p.slug} removed.`,
                            });
                          } else {
                            let msg = `Could not delete '${p.slug}'.`;
                            try {
                              const j = await res.json();
                              if (j?.errors?.length) msg = j.errors.join(", ");
                            } catch {}
                            // rollback only if it still exists in optimistic 'previous'
                            const wasPresent = (previous as any[])?.some(
                              (pg: any) => pg.id === p.id,
                            );
                            if (wasPresent) mutate(previous, false);
                            push({
                              variant: "error",
                              title: "Delete failed",
                              message: msg,
                            });
                          }
                        } catch (e: any) {
                          console.error("[page-delete] network error", e);
                          const wasPresent = (previous as any[])?.some(
                            (pg: any) => pg.id === p.id,
                          );
                          if (wasPresent) mutate(previous, false);
                          push({
                            variant: "error",
                            title: "Delete failed",
                            message:
                              e?.message || `Could not delete '${p.slug}'.`,
                          });
                        }
                        setPendingDelete((s) => {
                          const { [p.id]: _, ...rest } = s;
                          return rest;
                        });
                      }}
                      aria-label={`Delete page ${p.slug}`}
                    >
                      {pendingDelete[p.id] ? "Deleting…" : "Delete"}
                    </button>
                    <form
                      action={`/api/app/pages/${p.id}/publish`}
                      method="post"
                      onSubmit={() =>
                        track("lp_publish_clicked", { page_id: p.id })
                      }
                    >
                      <button className="btn btn-solid text-xs">
                        {p.status === "published" ? "Republish" : "Publish"}
                      </button>
                    </form>
                  </div>
                </Card>
              ))}
            {!Array.isArray(data) && !isLoading && !error && (
              <div className="text-xs text-amber-600">
                Unexpected response format.
              </div>
            )}
          </div>
        </section>
      </Container>
    </AppShell>
  );
}
