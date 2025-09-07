"use client";
import { useState, useEffect, useCallback } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import { Wand2, Send, Eye, Code, Sparkles, Activity } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import dynamic from "next/dynamic";
const RichEditor = dynamic(() => import("@/components/RichEditor"), {
  ssr: false,
});

// Lightweight utility components (could be promoted to design-system)
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
      {children}
    </label>
  );
}
function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "input focus:outline-none focus:ring-2 focus:ring-black/5 " +
        (props.className || "")
      }
    />
  );
}
function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "btn btn-solid gap-2 shadow-sm hover:shadow transition " +
        (props.className || "")
      }
    />
  );
}
function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "btn btn-outline gap-2 hover:bg-zinc-50 transition " +
        (props.className || "")
      }
    />
  );
}

export default function Designer() {
  const plan = usePlan();
  const [subject, setSubject] = useState("Welcome to Kit Builders");
  const [html, setHtml] = useState("<p>Happy to have you!</p>");
  const [to, setTo] = useState("test@local.test");
  const [activeTab, setActiveTab] = useState<"design" | "preview" | "html">(
    "design",
  );
  const [showSendDialog, setShowSendDialog] = useState(false);

  useEffect(() => {
    if (activeTab === "preview") {
      const frame = document.getElementById(
        "email-preview",
      ) as HTMLIFrameElement | null;
      if (frame) frame.srcdoc = html;
    }
  }, [html, activeTab]);

  const sendTest = useCallback(async () => {
    await fetch("/api/app/broadcasts/test", {
      method: "POST",
      body: JSON.stringify({ email: to, subject, html }),
    });
    setShowSendDialog(false);
  }, [to, subject, html]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Email Designer
            </h1>
            <p className="text-xs text-zinc-500">
              Craft, preview & test your broadcast
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan !== "Starter" && (
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <a
                    href="/analytics/broadcast/1"
                    className="text-xs px-3 py-2 rounded-lg bg-gradient-to-br from-zinc-100 to-white border border-zinc-200 hover:from-white hover:to-zinc-100 transition inline-flex items-center gap-1 font-medium"
                  >
                    <Activity size={14} /> Analytics
                  </a>
                </Tooltip.Trigger>
                <Tooltip.Content
                  side="bottom"
                  className="text-xs bg-black text-white px-2 py-1 rounded-md shadow"
                >
                  View performance metrics
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
          <SecondaryButton onClick={() => setActiveTab("preview")}>
            <Eye size={14} />
            Preview
          </SecondaryButton>
          <PrimaryButton onClick={() => setShowSendDialog(true)}>
            <Send size={14} />
            Send Test
          </PrimaryButton>
        </div>
      </header>

      <Tabs.Root
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as any)}
        className="flex flex-col gap-4"
      >
        <Tabs.List className="inline-flex gap-1 rounded-xl bg-zinc-100 p-1 w-fit">
          <Tabs.Trigger
            value="design"
            className={
              "px-4 py-2 rounded-lg text-xs font-medium transition data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-black text-zinc-500"
            }
          >
            Design
          </Tabs.Trigger>
          <Tabs.Trigger
            value="preview"
            className={
              "px-4 py-2 rounded-lg text-xs font-medium transition data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-black text-zinc-500"
            }
          >
            Preview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="html"
            className={
              "px-4 py-2 rounded-lg text-xs font-medium transition data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-black text-zinc-500"
            }
          >
            HTML
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="design" className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="grid gap-4">
              <Field>
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                />
              </Field>
              <Field>
                <Label>Content</Label>
                <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                  <RichEditor content={html} onChange={setHtml} />
                </div>
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <SecondaryButton type="button">
                <Wand2 size={14} />
                AI Improve
              </SecondaryButton>
              <SecondaryButton type="button">
                <Code size={14} />
                Insert Snippet
              </SecondaryButton>
            </div>
          </div>
          <div className="card p-4 flex flex-col">
            <h2 className="text-xs font-semibold text-zinc-500 tracking-wide mb-2">
              Live Preview
            </h2>
            <iframe
              id="email-preview"
              className="w-full flex-1 h-[70vh] border rounded-lg bg-white"
            />
          </div>
        </Tabs.Content>
        <Tabs.Content value="preview" className="card p-4">
          <iframe
            id="email-preview"
            className="w-full h-[75vh] border rounded-lg bg-white"
          />
        </Tabs.Content>
        <Tabs.Content value="html" className="card p-4">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full h-[75vh] font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </Tabs.Content>
      </Tabs.Root>

      <Dialog.Root open={showSendDialog} onOpenChange={setShowSendDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <Dialog.Title className="text-base font-semibold tracking-tight flex items-center gap-2">
              <Send size={16} /> Send Test Email
            </Dialog.Title>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendTest();
              }}
              className="space-y-4"
            >
              <Field>
                <Label>Recipient</Label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="test@example.com"
                  type="email"
                  required
                />
              </Field>
              <Field>
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton
                  type="button"
                  onClick={() => setShowSendDialog(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">Send</PrimaryButton>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
