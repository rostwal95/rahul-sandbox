"use client";
import useSWR from "swr";
import { useState } from "react";
import SegmentBuilder from "@/modules/audience/SegmentBuilder";
import { SafeList } from "@/components/SafeList";
import AppShell from "@/components/AppShell";
import { Container, Card, Skeleton } from "@kit/design-system";
const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Audience() {
  const {
    data: contacts,
    mutate,
    error: contactsErr,
  } = useSWR("/api/app/contacts", fetcher);
  const {
    data: segments,
    mutate: mutateSegments,
    error: segmentsErr,
  } = useSWR("/api/app/segments", fetcher);
  const [csvText, setCsvText] = useState(
    "email,name\njane@example.com,Jane Doe",
  );

  const importCsv = async () => {
    const res = await fetch("/api/app/contacts", {
      method: "POST",
      body: JSON.stringify({ csv: csvText }),
    });
    if (res.ok) {
      alert("Imported");
      mutate();
    }
  };

  const createSegment = async (name: string, filter: any) => {
    const body = { segment: { name, filter_json: filter } };
    const r = await fetch("/api/app/segments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (r.ok) mutateSegments();
  };

  const evaluate = async (id: number) => {
    const r = await fetch(`/api/app/segments/${id}/evaluate`);
    const j = await r.json();
    alert(`Segment size: ${j.count}`);
  };

  return (
    <AppShell>
      <Container size="xl" className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Audience</h1>
        <div className="mt-2 flex gap-2">
          <a className="btn btn-outline" href="/api/app/exports/contacts">
            Export All CSV
          </a>
          <a
            className="btn btn-outline"
            href="/api/app/exports/segment_contacts"
          >
            Export Segment CSV
          </a>
        </div>
        <section className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="font-medium mb-2">Import CSV</div>
            <textarea
              className="input h-40"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <button className="btn btn-solid mt-2" onClick={importCsv}>
              Import
            </button>
          </Card>
          <SegmentBuilder onCreate={createSegment} />
        </section>

        <section>
          <h2 className="font-medium my-2">Contacts</h2>
          <SafeList
            className="grid gap-2"
            items={contacts}
            loading={contacts === undefined && !contactsErr}
            error={contactsErr}
            unexpectedLabel="Unexpected contacts shape"
            render={(c: any) => (
              <Card className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.email}</div>
                  <div className="text-xs text-zinc-500">{c.name || "-"}</div>
                </div>
              </Card>
            )}
            keyFn={(c: any) => c.id}
          />
        </section>

        <section>
          <h2 className="font-medium my-2">Segments</h2>
          <SafeList
            className="grid gap-2"
            items={segments}
            loading={segments === undefined && !segmentsErr}
            error={segmentsErr}
            unexpectedLabel="Unexpected segments shape"
            render={(s: any) => (
              <Card className="p-3 flex items-center justify-between">
                <div>{s.name}</div>
                <button
                  className="btn btn-outline"
                  onClick={() => evaluate(s.id)}
                >
                  Evaluate
                </button>
              </Card>
            )}
            keyFn={(s: any) => s.id}
          />
        </section>
      </Container>
    </AppShell>
  );
}
