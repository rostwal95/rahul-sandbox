"use client";

import TopBar from "@/components/TopBar";
import OnboardingDrawer from "@/components/OnboardingDrawer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PageHeading from "@/components/PageHeading";
import { toast } from "@/components/ToastHost";
import RichTextEditor from "@/components/RichTextEditor";

const EMAIL_TEMPLATES = [
  {
    id: "announce",
    name: "Announcement",
    subject: "We’re live: [Product] beta is open 🚀",
    body: `<h2>We just launched!</h2><p>Hey {{first_name}},</p><p>After months of building, <b>[Product]</b> is ready for you. Here’s what’s inside:</p><ul><li>Feature A</li><li>Feature B</li><li>Feature C</li></ul><p><a href='#'>Try the beta →</a></p><p>— Your Name</p>`,
  },
  {
    id: "newsletter",
    name: "Newsletter",
    subject: "This week: [Theme], 3 quick ideas",
    body: `<h2>3 ideas on [Theme]</h2><ol><li>Idea #1</li><li>Idea #2</li><li>Idea #3</li></ol><p>Plus links: <a href='#'>Link A</a>, <a href='#'>Link B</a></p><p>— Your Name</p>`,
  },
  {
    id: "sale",
    name: "Sale",
    subject: "Only 48 hours: [Offer] ends soon",
    body: `<h2>Limited‑time offer</h2><p>Save <b>XX%</b> on [Offer] until midnight.</p><ul><li>Benefit 1</li><li>Benefit 2</li></ul><p><a href='#'>Grab the deal →</a></p>`,
  },
  {
    id: "welcome",
    name: "Welcome",
    subject: "Welcome aboard, {{first_name}} 👋",
    body: `<h2>Welcome!</h2><p>Thrilled to have you here. Here’s what to expect:</p><ul><li>1–2 emails/week</li><li>Best resources only</li></ul><p>Hit reply and tell me your #1 goal.</p>`,
  },
];

const tones = [
  "Friendly",
  "Professional",
  "Urgent",
  "Playful",
  "Bold",
] as const;
function genSubjectIdeas({
  topic,
  tone,
}: {
  topic: string;
  tone: (typeof tones)[number];
}) {
  const base = topic?.trim() || "your next launch";
  const ideas = [
    `${base}: 3 quick wins`,
    `New: ${base} — what to do next`,
    `${tone === "Urgent" ? "Last chance" : "Don’t miss"}: ${base}`,
    `The simple guide to ${base}`,
    `${base} — from zero to first results`,
  ];
  if (tone === "Playful") ideas.push(`I did a thing 😅 (${base})`);
  if (tone === "Bold") ideas.push(`${base.toUpperCase()} — read this first`);
  return ideas.slice(0, 5);
}

export default function BroadcastPage() {
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("<p>Write your email…</p>");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("Friendly");

  useEffect(() => {
    try {
      localStorage.setItem("kit_draft_broadcast_subject", subject);
    } catch {}
  }, [subject]);
  useEffect(() => {
    try {
      localStorage.setItem("kit_draft_broadcast_body", body);
    } catch {}
  }, [body]);
  useEffect(() => {
    try {
      const s = localStorage.getItem("kit_draft_broadcast_subject");
      if (s) setSubject(s);
      const b = localStorage.getItem("kit_draft_broadcast_body");
      if (b) setBody(b);
    } catch {}
  }, []);

  const ideas = genSubjectIdeas({ topic, tone });

  return (
    <div>
      <TopBar onOpenOnboarding={() => setOnboardOpen(true)} />
      <main className="mx-auto max-w-[960px] px-4 py-6 space-y-6">
        <PageHeading
          title="New Email Broadcast"
          subtitle="Choose a template or craft from scratch, then ship it."
          className="mb-2"
          actions={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast("Draft autosaved", "info")}
              >
                Autosave
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => toast("Share link copied", "success")}
              >
                Share
              </Button>
            </div>
          }
        />

        <Card className="p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold">Templates</h2>
            <div className="flex gap-2">
              <Button
                variant="subtle"
                onClick={() => {
                  setSubject("");
                  setBody("<p>Write your email…</p>");
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EMAIL_TEMPLATES.map((t) => (
              <button
                key={t.id}
                className="group relative text-left rounded-xl border border-[rgba(var(--border),0.8)] bg-[rgb(var(--card))] p-3 hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.05)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.4)]"
                onClick={() => {
                  setSubject(t.subject);
                  setBody(t.body);
                }}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium truncate" title={t.name}>
                    {t.name}
                  </span>
                  <span
                    className="text-xs text-zinc-500 line-clamp-2 leading-snug min-h-[2.1rem]"
                    title={t.subject}
                  >
                    {t.subject}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Input
          placeholder="Subject line"
          value={subject}
          onChange={(e: any) => setSubject(e.target.value)}
        />
        <Card className="p-5 mt-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="grow">
              <label className="text-xs text-zinc-500">Topic or offer</label>
              <Input
                placeholder="e.g., launch discount, onboarding tips"
                value={topic}
                onChange={(e: any) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Tone</label>
              <select
                className="input"
                value={tone}
                onChange={(e: any) => setTone(e.target.value)}
              >
                {tones.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <Button variant="secondary" onClick={() => setSubject(ideas[0])}>
              Apply best
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {ideas.map((s, i) => (
              <button
                key={i}
                className="text-left rounded-lg border border-[rgba(var(--border),0.7)] bg-[rgb(var(--card))] p-2 text-sm hover:bg-[rgba(var(--accent),0.05)] hover:border-[rgba(var(--accent),0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.4)] truncate"
                onClick={() => setSubject(s)}
                title={s}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        <div className="mt-4">
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {/* Render literal placeholder token */}
          <Button
            variant="outline"
            onClick={() => setBody((b) => b + "<p>Hi {{first_name}},</p>")}
          >
            + {"{{first_name}}"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setBody((b) => b + "<p>👀 Quick heads‑up…</p>")}
          >
            + Emoji opener
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setBody((b) => b + "<p><a href='#'>Call to action →</a></p>")
            }
          >
            + CTA link
          </Button>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => toast("Preview opened (demo)")}
          >
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => toast("Draft saved", "success")}
          >
            Save
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast("Sent (demo)", "success");
              location.href = "/dashboard";
            }}
          >
            Send
          </Button>
        </div>
      </main>
      <OnboardingDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
      />
    </div>
  );
}
