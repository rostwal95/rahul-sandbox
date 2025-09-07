"use client";
import useSWR from "swr";
import { useState } from "react";
import Designer from "@/modules/email/Designer";
import EmailTemplatesGallery from "@/modules/email/TemplatesGallery";
import { SafeList } from "@/components/SafeList";
import AppShell from "@/components/AppShell";
import { Container, Card, Skeleton } from "@kit/design-system";
const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Broadcasts() {
  const { data, mutate, error } = useSWR("/api/app/broadcasts", fetcher);
  const [subject, setSubject] = useState("Hello from Kit Builders");
  const [html, setHtml] = useState(
    "<h1>Welcome!</h1><p>Thanks for joining.</p>",
  );

  const create = async () => {
    const r = await fetch("/api/app/broadcasts", {
      method: "POST",
      body: JSON.stringify({ broadcast: { org_id: 1, subject, html } }),
    });
    if (r.ok) mutate();
  };
  const testSend = async () => {
    await fetch("/api/app/broadcasts/test", {
      method: "POST",
      body: JSON.stringify({ email: "test@local.test", subject, html }),
    });
    alert("Sent to Mailhog (http://localhost:8025)");
  };

  return (
    <AppShell>
      <Container size="xl" className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email Broadcasts
        </h1>
        <section className="space-y-4">
          <h2 className="text-sm font-medium tracking-tight">
            Start from a template
          </h2>
          <EmailTemplatesGallery
            onPick={(tpl) => {
              setSubject(tpl.subject);
              setHtml(tpl.html);
            }}
          />
        </section>
        <Designer />
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={testSend}>
            Send Test (Mailhog)
          </button>
          <button className="btn btn-solid" onClick={create}>
            Save Broadcast
          </button>
        </div>
        <SafeList
          className="grid gap-3"
          items={data}
          loading={data === undefined && !error}
          error={error}
          unexpectedLabel="Unexpected broadcasts shape"
          render={(b: any) => (
            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{b.subject}</div>
                <div className="text-sm text-zinc-500">{b.status}</div>
              </div>
              <form
                action={`/api/app/broadcasts/${b.id}/send_now`}
                method="post"
              >
                <button className="btn btn-solid">Send Now</button>
              </form>
            </Card>
          )}
          keyFn={(b: any) => b.id}
        />
      </Container>
    </AppShell>
  );
}
