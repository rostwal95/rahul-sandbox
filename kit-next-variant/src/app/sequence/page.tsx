"use client";

import TopBar from "@/components/TopBar";
import OnboardingDrawer from "@/components/OnboardingDrawer";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import { MailPlus, GripVertical } from "lucide-react";

export default function SequencePage() {
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [emails, setEmails] = useState<
    { id: number; subject: string; delay: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      setEmails([{ id: 1, subject: "Welcome!", delay: "Day 0" }]);
      setLoading(false);
    }, 450);
    return () => clearTimeout(t);
  }, []);

  const addEmail = useCallback(
    () =>
      setEmails((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          subject: "New Email",
          delay: `Day ${prev.length * 2}`,
        },
      ]),
    []
  );

  // Keyboard shortcut: 'a' adds a new email (unless focused in input/textarea)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey ||
        e.repeat ||
        (e.target instanceof HTMLElement &&
          (e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA" ||
            (e.target as HTMLElement).isContentEditable))
      )
        return;
      if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        addEmail();
        requestAnimationFrame(() => {
          document
            .getElementById("sequence-list-end")
            ?.scrollIntoView({ behavior: "smooth" });
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Drag & Drop handlers
  const onDragStart = useCallback(
    (id: number) => (e: React.DragEvent) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(id));
    },
    []
  );
  const onDragOver = useCallback(
    (overId: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId === null || dragId === overId) return;
    },
    [dragId]
  );
  const onDrop = useCallback(
    (overId: number) => (e: React.DragEvent) => {
      e.preventDefault();
      const sourceId = dragId;
      setDragId(null);
      if (sourceId === null || sourceId === overId) return;
      setEmails((prev) => {
        const srcIdx = prev.findIndex((x) => x.id === sourceId);
        const overIdx = prev.findIndex((x) => x.id === overId);
        if (srcIdx === -1 || overIdx === -1) return prev;
        const clone = [...prev];
        const [item] = clone.splice(srcIdx, 1);
        clone.splice(overIdx, 0, item);
        return clone;
      });
    },
    [dragId]
  );
  const onDragEnd = useCallback(() => setDragId(null), []);
  return (
    <div>
      <TopBar onOpenOnboarding={() => setOnboardOpen(true)} />
      <main className="mx-auto max-w-[880px] px-4 py-6 space-y-6">
        <PageHeading
          title="Newsletter Sequence"
          subtitle="Manage drip emails and autoresponder timing."
          className="mb-1"
        />
        {loading ? (
          <div className="space-y-3" aria-busy>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="p-4 flex items-start justify-between gap-4 animate-pulse"
              >
                <div className="min-w-0 space-y-2 w-full">
                  <div className="h-4 w-40 rounded bg-[rgba(var(--fg),0.1)]" />
                  <div className="h-3 w-16 rounded bg-[rgba(var(--fg),0.08)]" />
                </div>
                <div className="h-6 w-16 rounded bg-[rgba(var(--fg),0.1)]" />
              </Card>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <EmptyState
            title="No emails in sequence yet"
            description="Start building your drip sequence. Add welcome, nurture, and sales emails with timed delays."
            icon={<MailPlus className="h-8 w-8" />}
            action={
              <Button variant="primary" size="sm" onClick={addEmail}>
                Add first email
              </Button>
            }
          />
        ) : (
          <>
            <ul
              role="list"
              aria-label="Sequence emails (draggable)"
              className="space-y-3"
            >
              {emails.map((e) => (
                <li
                  key={e.id}
                  role="listitem"
                  draggable
                  onDragStart={onDragStart(e.id)}
                  onDragOver={onDragOver(e.id)}
                  onDrop={onDrop(e.id)}
                  onDragEnd={onDragEnd}
                  className={dragId === e.id ? "opacity-60" : ""}
                >
                  <Card
                    className="p-4 flex items-start justify-between gap-4 cursor-grab active:cursor-grabbing"
                    aria-grabbed={dragId === e.id}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="mt-0.5 text-zinc-400" aria-hidden>
                        <GripVertical className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h2
                          className="font-medium text-sm truncate"
                          title={e.subject}
                        >
                          {e.subject}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">{e.delay}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Remove email ${e.subject}`}
                        onClick={() =>
                          setEmails((prev) => prev.filter((x) => x.id !== e.id))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
            <Button
              variant="primary"
              onClick={addEmail}
              className="mt-4"
              id="sequence-list-end"
            >
              + Add Email
            </Button>
          </>
        )}
      </main>
      <OnboardingDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
      />
    </div>
  );
}
