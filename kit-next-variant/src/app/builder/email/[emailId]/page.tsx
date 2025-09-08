"use client";

import TopBar from "@/components/TopBar";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useMemo, useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { TiptapEditor } from "@/lib/editor/tiptap";
import { toast } from "@/components/ToastHost";

export default function EmailDesigner() {
  const { emailId } = useParams<{ emailId: string }>();
  const [subject, setSubject] = useState("Untitled Email");
  const [variantB, setVariantB] = useState("");
  const [preheader, setPreheader] = useState("");
  const [body, setBody] = useState("");
  const [subjectHistory, setSubjectHistory] = useState<string[]>([]);
  const [seed, setSeed] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );
  // Broadcast meta
  const [internalLabel, setInternalLabel] = useState("Broadcast #1");
  const [segment, setSegment] = useState("All Subscribers");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [testEmail, setTestEmail] = useState("");
  const [unsaved, setUnsaved] = useState(false);

  const plainBody = useMemo(
    () =>
      body
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    [body]
  );

  const suggestions = useMemo(() => {
    const base = subject || "Your update";
    const roots = [
      `Inside: ${base}`,
      `${base} → What changed`,
      `${base} (New Guide)`,
      `${base} in 5 minutes`,
      `${base}? Here’s the plan`,
      `🚀 ${base} Launch Notes`,
      `Avoid these mistakes in ${base}`,
    ];
    const rotated = roots
      .slice(seed % roots.length)
      .concat(roots.slice(0, seed % roots.length));
    return rotated.slice(0, 7);
  }, [subject, seed]);

  const bodyRewrites = useMemo(() => {
    const plain = plainBody.split(/\s+/).slice(0, 120).join(" ");
    const concise = plain
      .replace(/\b(really|very|actually|just)\b/gi, "")
      .replace(/\s{2,}/g, " ");
    const action =
      "Here's what you can do next: " +
      (plain
        .match(/\b\w+\b/g)
        ?.slice(-10)
        .join(" ") || "try these steps today.");
    const listified = plain
      .split(/\.(\s|$)/)
      .filter(Boolean)
      .slice(0, 5)
      .map((s) => "• " + s.trim())
      .join("\n");
    return [
      { label: "Concise Intro", text: concise },
      { label: "Action Close", text: action },
      { label: "Bullet Extract", text: listified },
    ];
  }, [plainBody]);

  const SPAM_WORDS: { w: RegExp; weight: number; hint: string }[] = [
    {
      w: /free/gi,
      weight: 2,
      hint: "Consider being more specific than 'free'",
    },
    { w: /100%/gi, weight: 1.5, hint: "Absolute claim" },
    {
      w: /guarantee/gi,
      weight: 2.5,
      hint: "'Guarantee' can hurt deliverability",
    },
    { w: /earn\s?\$/gi, weight: 3, hint: "Money-earning phrasing" },
    { w: /money\s?back/gi, weight: 1.5, hint: "Refund phrasing" },
    { w: /act now/gi, weight: 1.2, hint: "High urgency" },
    { w: /risk\s?free/gi, weight: 2, hint: "Risk-free" },
    { w: /winner|prize/gi, weight: 2.2, hint: "Contest wording" },
  ];
  const spamFindings = useMemo(() => {
    const target = (subject + " " + plainBody).toLowerCase();
    const hits: {
      term: string;
      count: number;
      weight: number;
      hint: string;
    }[] = [];
    SPAM_WORDS.forEach(({ w, weight, hint }) => {
      const m = target.match(w);
      if (m && m.length)
        hits.push({
          term: w.source.replace(/\\/g, ""),
          count: m.length,
          weight,
          hint,
        });
    });
    const score = hits.reduce((a, h) => a + h.weight * h.count, 0);
    return { hits, score: parseFloat(score.toFixed(1)) };
  }, [subject, plainBody]);
  const spamSeverity =
    spamFindings.score > 8 ? "high" : spamFindings.score > 4 ? "medium" : "low";

  interface LinkInfo {
    url: string;
    domain: string;
    hasUTM: boolean;
    duplicate: boolean;
    secure: boolean;
  }
  const links: LinkInfo[] = useMemo(() => {
    const regex = /<a [^>]*href=["']([^"']+)["'][^>]*>/gi;
    const found: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(body))) found.push(m[1]);
    return found.map((u, i, arr) => {
      const domainMatch = u.replace(/https?:\/\//, "").split(/[\/#?]/)[0];
      return {
        url: u,
        domain: domainMatch,
        hasUTM: /[?&]utm_source=/i.test(u),
        duplicate: arr.indexOf(u) !== i,
        secure: /^https:/.test(u),
      };
    });
  }, [body]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`kit_email_subject_history_${emailId}`);
      if (raw) setSubjectHistory(JSON.parse(raw));
    } catch {}
  }, [emailId]);
  const persistHistory = (next: string[]) => {
    setSubjectHistory(next);
    try {
      localStorage.setItem(
        `kit_email_subject_history_${emailId}`,
        JSON.stringify(next.slice(-25))
      );
    } catch {}
  };
  const addToHistory = (s: string) => {
    if (!s.trim() || subjectHistory.includes(s)) return;
    persistHistory([...subjectHistory, s].slice(-25));
    toast("Subject saved", "success");
  };
  const removeFromHistory = (s: string) =>
    persistHistory(subjectHistory.filter((x) => x !== s));

  const subjectCount = subject.trim().length;
  const subjectHint = useMemo(
    () =>
      subjectCount < 30
        ? "Short & punchy"
        : subjectCount <= 55
        ? "Great length"
        : "Maybe too long",
    [subjectCount]
  );
  const wordCount = plainBody ? plainBody.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200 || 1));
  const linkCount = links.length;
  function predictOpenRate(s: string) {
    if (!s) return 0;
    let rate = 24;
    const len = s.length;
    if (len >= 30 && len <= 55) rate += 2;
    else if (len > 60) rate -= 3;
    else if (len < 10) rate -= 2;
    if (/[0-9]/.test(s)) rate += 1;
    if (/\b(free|new|guide|tips|today|fast)\b/i.test(s)) rate += 1.5;
    if (/!/.test(s) && len < 60) rate += 0.5;
    if (/\?/.test(s)) rate += 0.8;
    return parseFloat(Math.max(5, Math.min(60, rate)).toFixed(1));
  }
  const openA = predictOpenRate(subject);
  const openB = variantB ? predictOpenRate(variantB) : 0;
  const lift = variantB ? (openB - openA).toFixed(1) : null;

  // Track unsaved edits (simple heuristic)
  useEffect(() => {
    setUnsaved(true);
    const t = setTimeout(() => setUnsaved(false), 1200);
    return () => clearTimeout(t);
  }, [
    subject,
    variantB,
    preheader,
    body,
    internalLabel,
    segment,
    scheduleMode,
    scheduledAt,
  ]);

  // Body autosave
  useEffect(() => {
    try {
      localStorage.setItem(
        `kit_email_draft_${emailId}`,
        JSON.stringify({
          subject,
          variantB,
          preheader,
          body,
          internalLabel,
          segment,
          scheduleMode,
          scheduledAt,
        })
      );
    } catch {}
  }, [
    subject,
    variantB,
    preheader,
    body,
    internalLabel,
    segment,
    scheduleMode,
    scheduledAt,
    emailId,
  ]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`kit_email_draft_${emailId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSubject(parsed.subject || "");
        setVariantB(parsed.variantB || "");
        setPreheader(parsed.preheader || "");
        setBody(parsed.body || "");
        setInternalLabel(parsed.internalLabel || "Broadcast #1");
        setSegment(parsed.segment || "All Subscribers");
        setScheduleMode(parsed.scheduleMode || "now");
        setScheduledAt(parsed.scheduledAt || "");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergeTags = [
    "{{first_name}}",
    "{{last_name}}",
    "{{unsubscribe_link}}",
    "{{company}}",
    "{{current_date}}",
  ];
  const snippets = [
    {
      label: "CTA Buttons",
      html: '<p><a href="https://example.com" style="background:#6366F1;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-family:system-ui">Click Here</a></p>',
    },
    {
      label: "Signature",
      html: "<p>—<br/>Cheers,<br/><strong>Your Name</strong><br/>Founder</p>",
    },
    {
      label: "Divider",
      html: '<hr style="border:none;border-top:1px solid #e2e2e2;margin:28px 0"/>',
    },
  ];

  const insertAtEnd = (frag: string) =>
    setBody((b) => b + (b.endsWith("\n") ? "" : "\n") + frag);
  const insertMergeTag = (tag: string) => insertAtEnd(tag);
  const insertSnippet = (html: string) => insertAtEnd(html);

  const sendTest = () => {
    if (!testEmail.trim()) {
      toast("Enter test email", "error");
      return;
    }
    toast("Test email queued (demo)", "success");
  };
  const scheduleOrSend = () => {
    if (scheduleMode === "later" && !scheduledAt) {
      toast("Pick a send time", "error");
      return;
    }
    if (scheduleMode === "later")
      toast(`Scheduled for ${scheduledAt}`, "success");
    else toast("Broadcast sent (demo)", "success");
  };

  const subjectRef = useRef<HTMLInputElement | null>(null);

  const smartInsertMergeTag = (tag: string) => {
    if (!subjectRef.current) return insertMergeTag(tag);
    const el = subjectRef.current;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const next = subject.slice(0, start) + tag + subject.slice(end);
    setSubject(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + tag.length;
      el.setSelectionRange(pos, pos);
    });
  };

  // Remember assistant panel open state
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kit_email_assistant_open");
      if (raw) setShowAssistant(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "kit_email_assistant_open",
        JSON.stringify(showAssistant)
      );
    } catch {}
  }, [showAssistant]);

  // Accent sync pulled from landing page draft theme if present
  const [accent, setAccent] = useState<string>("#6366F1");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kit_draft_page");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.theme) setAccent(parsed.theme);
      }
    } catch {}
  }, []);

  // Inline merge tag autocomplete for body editor
  const bodyEditorContainerRef = useRef<HTMLDivElement | null>(null);
  const [tagSuggest, setTagSuggest] = useState<{
    open: boolean;
    query: string;
    pos: { x: number; y: number };
  }>({ open: false, query: "", pos: { x: 0, y: 0 } });

  useEffect(() => {
    const el = bodyEditorContainerRef.current?.querySelector(
      '[contenteditable="true"]'
    );
    if (!el) return;
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const preceding = range.startContainer.textContent?.slice(
        0,
        range.startOffset
      );
      if (preceding == null) return;
      const match = preceding.match(/\{\{([a-z_]*)$/i);
      if (match) {
        const rect = range.getBoundingClientRect();
        setTagSuggest({
          open: true,
          query: match[1].toLowerCase(),
          pos: {
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY,
          },
        });
      } else if (tagSuggest.open) {
        setTagSuggest((s) => ({ ...s, open: false }));
      }
    };
    el.addEventListener("keyup", handler);
    return () => el.removeEventListener("keyup", handler);
  }, [tagSuggest.open]);

  const filteredMerge = useMemo(
    () =>
      tagSuggest.query
        ? mergeTags.filter((t) => t.toLowerCase().includes(tagSuggest.query))
        : mergeTags,
    [tagSuggest.query, mergeTags]
  );
  const applyInlineMerge = (tag: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType === 3) {
      const txt = node.textContent || "";
      const newTxt = txt.replace(/\{\{[a-z_]*$/i, tag);
      (node as Text).textContent = newTxt;
      const pos = newTxt.length;
      const newRange = document.createRange();
      newRange.setStart(node, pos);
      newRange.setEnd(node, pos);
      sel.removeAllRanges();
      sel.addRange(newRange);
      setTagSuggest({ open: false, query: "", pos: { x: 0, y: 0 } });
    }
  };
  return (
    <div className="relative">
      <TopBar />
      {/* Page hero header (consistent with other pages) */}
      <div className="container-wide px-6 pt-6">
        <Card className="p-6 md:p-7 mb-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight gradient-text">
                  Broadcast Email
                </h1>
                {unsaved && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    Saving…
                  </span>
                )}
              </div>
              <p className="text-sm text-muted max-w-2xl">
                Craft & schedule a broadcast to your audience. Track quality &
                deliverability as you write.
              </p>
            </div>
            <div className="w-full md:w-[340px] flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted">
                    Internal Label
                  </label>
                  <Input
                    value={internalLabel}
                    onChange={(e) => setInternalLabel(e.target.value)}
                    placeholder="Internal name"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted">
                    Segment
                  </label>
                  <select
                    className="input w-full"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                  >
                    {[
                      "All Subscribers",
                      "Active (30d)",
                      "Trial Users",
                      "Customers",
                      "VIP List",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted">
                    Send Mode
                  </label>
                  <select
                    className="input w-full"
                    value={scheduleMode}
                    onChange={(e) => setScheduleMode(e.target.value as any)}
                  >
                    <option value="now">Send Now</option>
                    <option value="later">Schedule</option>
                  </select>
                </div>
                {scheduleMode === "later" && (
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-muted">
                      Scheduled (local)
                    </label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating actions bar */}
      <div className="sticky top-0 z-30 pointer-events-none">
        <div className="container-wide px-6 pt-3 flex justify-end gap-2 pointer-events-auto">
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-full backdrop-blur bg-[rgba(var(--bg-1),0.55)] hover:bg-[rgba(var(--bg-1),0.8)] transition-all"
              >
                Test
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                className="w-64 rounded-lg border border-[rgba(var(--border),0.5)] bg-[rgb(var(--bg))] p-3 shadow-sm space-y-2 text-[12px] animate-in fade-in zoom-in-95"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-medium">Test Email</label>
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setTestEmail("")}
                  >
                    Clear
                  </Button>
                  <Button size="xs" onClick={sendTest}>
                    Send Test
                  </Button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-full backdrop-blur bg-[rgba(var(--bg-1),0.55)] hover:bg-[rgba(var(--bg-1),0.8)] transition-all"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-full shadow-sm hover:shadow-md transition-all"
            onClick={() => {
              addToHistory(subject);
              scheduleOrSend();
            }}
          >
            {scheduleMode === "later" ? "Schedule" : "Send"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 rounded-full"
            onClick={() => setShowAssistant((s) => !s)}
          >
            {showAssistant ? "Close" : "Assistant"}
          </Button>
        </div>
      </div>

      <main className="container-wide px-6 py-6 flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <Card className="p-6 md:p-7 rounded-xl border border-[rgba(var(--border),0.5)] shadow-sm hover:shadow-md transition-shadow bg-[linear-gradient(140deg,rgba(var(--bg-1),0.85),rgba(var(--bg-2),0.65))] backdrop-blur-sm focus-within:ring-1 focus-within:ring-indigo-400/40 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-2">
                  Subject
                </label>
                <div className="flex gap-3 items-stretch">
                  <Input
                    ref={subjectRef}
                    className="h-11 text-sm md:text-base font-medium placeholder:font-normal placeholder:text-muted-2"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Write a compelling subject…"
                  />
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-11"
                      >
                        Suggest
                      </Button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        side="bottom"
                        align="end"
                        className="w-72 rounded-md border border-[rgba(var(--border),0.5)] bg-[rgb(var(--bg))] p-2 shadow-sm text-[12px] space-y-1 animate-in fade-in zoom-in-95"
                      >
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSubject(s)}
                            className="w-full text-left px-2 py-1 rounded hover:bg-[rgba(var(--fg),0.06)] truncate"
                            title={s}
                          >
                            {s}
                          </button>
                        ))}
                        <div className="pt-1 flex justify-end">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setSeed((sd) => sd + 1)}
                          >
                            Refresh
                          </Button>
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
                <div className="flex flex-wrap gap-3 text-[10px] text-muted-2">
                  <span>{subjectCount} chars</span>
                  <span>{subjectHint}</span>
                  <span>Open {openA}%</span>
                  {!!variantB && (
                    <span className="text-emerald-500">Lift {lift}%</span>
                  )}
                </div>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted-2">
                    Variant B (optional)
                  </label>
                  <Input
                    value={variantB}
                    onChange={(e) => setVariantB(e.target.value)}
                    placeholder="Alternative subject"
                    className="h-10"
                  />
                  {variantB && (
                    <div className="text-[11px] text-muted-2 flex gap-2 flex-wrap">
                      <span>Open B {openB}%</span>
                      <span className="text-emerald-500">Lift {lift}%</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-1 lg:col-span-2">
                  <label className="text-[11px] font-medium text-muted-2">
                    Preheader
                  </label>
                  <Input
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    placeholder="Short preview line shown in inbox"
                    className="h-10"
                  />
                  <div className="text-[11px] text-muted-2">
                    {preheader.length} chars
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden rounded-xl border border-[rgba(var(--border),0.4)] bg-[linear-gradient(150deg,rgba(var(--bg-1),0.9),rgba(var(--bg-2),0.7))] backdrop-blur-sm transition-shadow hover:shadow-md">
            <div className="px-5 pt-5 pb-2 text-[11px] text-muted-2 flex flex-wrap gap-4">
              <span>
                {subjectCount} chars • {subjectHint}
              </span>
              <span>
                {wordCount} words (~{readingTime} min)
              </span>
              {variantB && <span>A/B lift: {lift}%</span>}
              <span>{linkCount} links</span>
              <span
                className={
                  spamSeverity === "high"
                    ? "text-red-500"
                    : spamSeverity === "medium"
                    ? "text-amber-500"
                    : ""
                }
              >
                {spamSeverity} spam
              </span>
            </div>
            {/* Removed separating border for softer surface */}
            <div className="p-5" ref={bodyEditorContainerRef}>
              <div className="relative">
                <TiptapEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Start writing…"
                />
                {tagSuggest.open && filteredMerge.length > 0 && (
                  <div
                    style={{
                      top: tagSuggest.pos.y + 4,
                      left: tagSuggest.pos.x,
                    }}
                    className="fixed z-50 w-56 rounded-md border border-[rgba(var(--border),0.5)] bg-[rgb(var(--bg))] shadow-sm p-1 text-[12px] max-h-60 overflow-auto"
                  >
                    {filteredMerge.slice(0, 14).map((t) => (
                      <button
                        key={t}
                        onClick={() => applyInlineMerge(t)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-[rgba(var(--fg),0.06)] font-mono"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
        {showAssistant && (
          <div className="w-[380px] shrink-0 space-y-4 animate-in slide-in-from-right">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold tracking-wide">
                  Assistant Tools
                </h2>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setShowAssistant(false)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-medium">
                    Subject Suggestions
                  </h3>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setSeed((s) => s + 1)}
                  >
                    Refresh
                  </Button>
                </div>
                <ul className="space-y-1.5 text-[11px]">
                  {suggestions.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <button
                        className="flex-1 text-left truncate hover:underline"
                        onClick={() => setSubject(s)}
                        title={s}
                      >
                        {s}
                      </button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => addToHistory(s)}
                      >
                        Save
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-[rgba(var(--border),0.4)]" />
              <div className="space-y-2">
                <h3 className="text-[11px] font-medium">Merge Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {mergeTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => insertMergeTag(t)}
                      className="text-[10px] px-2 py-1 rounded bg-[rgba(var(--fg),0.06)] hover:bg-[rgba(var(--fg),0.1)] font-mono"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[11px] font-medium">Snippets</h3>
                <div className="flex flex-wrap gap-1">
                  {snippets.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => insertSnippet(s.html)}
                      className="text-[10px] px-2 py-1 rounded border border-[rgba(var(--border),0.5)] hover:bg-[rgba(var(--fg),0.05)]"
                      title={s.label}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-[rgba(var(--border),0.4)]" />
              <div className="space-y-2">
                <h3 className="text-[11px] font-medium">Body Rewrites</h3>
                <ul className="space-y-2 max-h-44 overflow-auto pr-1">
                  {bodyRewrites.map((r) => (
                    <li
                      key={r.label}
                      className="group border border-[rgba(var(--border),0.4)] rounded-md p-2 bg-[rgba(var(--fg),0.02)] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate" title={r.label}>
                          {r.label}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => {
                              const html = transformRewriteToHtml(r.text);
                              setBody((prev) => prev + html);
                              toast("Inserted", "success");
                            }}
                          >
                            Insert
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              const html = transformRewriteToHtml(r.text);
                              setBody(html);
                              toast("Replaced", "info");
                            }}
                          >
                            Replace
                          </Button>
                        </div>
                      </div>
                      <div
                        className="text-muted-2 line-clamp-3 whitespace-pre-wrap max-h-16 overflow-hidden text-[11px]"
                        title={r.text}
                      >
                        {r.text}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-[rgba(var(--border),0.4)]" />
              <div className="space-y-2">
                <h3 className="text-[11px] font-medium">Quality & Spam</h3>
                <div className="text-[11px]">
                  Score: {spamFindings.score} –{" "}
                  <span
                    className={
                      spamSeverity === "high"
                        ? "text-red-500"
                        : spamSeverity === "medium"
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }
                  >
                    {spamSeverity}
                  </span>
                </div>
                {spamFindings.hits.length === 0 && (
                  <div className="text-[11px] text-muted">No triggers</div>
                )}
                {spamFindings.hits.length > 0 && (
                  <ul className="text-[11px] space-y-1 max-h-24 overflow-auto pr-1">
                    {spamFindings.hits.map((h) => (
                      <li
                        key={h.term}
                        className="flex justify-between gap-2"
                        title={h.hint}
                      >
                        <span className="truncate">
                          <span className="font-medium">{h.term}</span> ×
                          {h.count}
                        </span>
                        <span className="text-muted-2">
                          {(h.weight * h.count).toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-[rgba(var(--border),0.4)]" />
              <div className="space-y-2">
                <h3 className="text-[11px] font-medium">
                  Links ({links.length})
                </h3>
                {links.length === 0 && (
                  <div className="text-[11px] text-muted">None</div>
                )}
                {links.length > 0 && (
                  <ul className="text-[11px] space-y-1 max-h-32 overflow-auto pr-1">
                    {links.map((l) => (
                      <li
                        key={l.url}
                        className="flex items-center gap-2 truncate"
                      >
                        <span className="truncate" title={l.url}>
                          {l.domain}
                        </span>
                        <div className="flex gap-1">
                          {!l.secure && (
                            <span className="px-1 rounded bg-red-500/15 text-red-500">
                              http
                            </span>
                          )}
                          {l.duplicate && (
                            <span className="px-1 rounded bg-amber-500/15 text-amber-500">
                              dup
                            </span>
                          )}
                          {!l.hasUTM && (
                            <span className="px-1 rounded bg-indigo-500/15 text-indigo-500">
                              utm?
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {links.length > 0 && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(
                          JSON.stringify(links, null, 2)
                        );
                        toast("Copied report", "success");
                      } catch {
                        toast("Copy failed", "error");
                      }
                    }}
                  >
                    Copy Report
                  </Button>
                )}
              </div>
              <div className="border-t border-[rgba(var(--border),0.4)]" />
              <div className="space-y-2">
                <h3 className="text-[11px] font-medium">Saved Subjects</h3>
                {subjectHistory.length === 0 && (
                  <div className="text-[11px] text-muted">None yet</div>
                )}
                {subjectHistory.length > 0 && (
                  <ul className="max-h-40 overflow-auto pr-1 space-y-1 text-[11px]">
                    {[...subjectHistory]
                      .slice()
                      .reverse()
                      .map((s) => (
                        <li key={s} className="group flex items-center gap-2">
                          <button
                            className="truncate flex-1 text-left hover:underline"
                            onClick={() => setSubject(s)}
                            title={s}
                          >
                            {s}
                          </button>
                          <button
                            className="opacity-0 group-hover:opacity-100 text-muted-2 hover:text-foreground transition text-[10px]"
                            onClick={() => removeFromHistory(s)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => addToHistory(subject)}
                    disabled={!subject.trim()}
                  >
                    Save current
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => persistHistory([])}
                    disabled={!subjectHistory.length}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-6 overflow-auto">
          <div className="w-full max-w-4xl bg-[rgb(var(--bg))] rounded-lg shadow-lg border border-[rgba(var(--border),0.5)] relative animate-in fade-in">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(var(--border),0.5)]">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium">Preview</h2>
                <div className="flex gap-1">
                  <Button
                    size="xs"
                    variant={
                      previewDevice === "desktop" ? "secondary" : "outline"
                    }
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    Desktop
                  </Button>
                  <Button
                    size="xs"
                    variant={
                      previewDevice === "mobile" ? "secondary" : "outline"
                    }
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    Mobile
                  </Button>
                </div>
              </div>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-6">
              <div
                className={
                  previewDevice === "mobile"
                    ? "mx-auto w-[380px] border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-neutral-900"
                    : "w-full"
                }
              >
                <div className="text-sm leading-relaxed">
                  <div className="px-4 py-3 border-b bg-[#f6f8fa] dark:bg-[rgba(var(--bg-1))]">
                    <div className="font-semibold">
                      {subject || "(No subject)"}
                    </div>
                    {!!preheader && (
                      <div className="text-[11px] text-muted-2 mt-0.5">
                        {preheader}
                      </div>
                    )}
                  </div>
                  <div
                    className="px-4 py-5 prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: body || "<p><em>(Empty body)</em></p>",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function transformRewriteToHtml(text: string) {
  if (!text) return "";
  if (/^• /m.test(text)) {
    const items = text
      .split(/\n+/)
      .filter((l) => l.trim())
      .map((l) => l.replace(/^•\s?/, "").trim());
    return (
      `<ul>` + items.map((i) => `<li>${escapeHtml(i)}</li>`).join("") + `</ul>`
    );
  }
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  return paragraphs || `<p>${escapeHtml(text)}</p>`;
}
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function GmailLikeFrame({
  subject,
  preheader,
  bodyHtml,
}: {
  subject: string;
  preheader: string;
  bodyHtml: string;
}) {
  return (
    <div className="text-sm leading-relaxed">
      <div className="px-4 py-3 border-b bg-[#f6f8fa] dark:bg-[rgba(var(--bg-1))]">
        <div className="font-semibold">{subject || "(No subject)"}</div>
        {preheader && (
          <div className="text-[11px] text-muted-2 mt-0.5">{preheader}</div>
        )}
      </div>
      <div
        className="px-4 py-5 prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </div>
  );
}
