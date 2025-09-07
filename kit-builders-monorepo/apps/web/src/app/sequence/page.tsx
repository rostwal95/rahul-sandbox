"use client";
import AppShell from "@/components/AppShell";
import {
  Container,
  Card,
  BlocksPalette,
  Button,
  TextField,
  Input,
} from "@kit/design-system";
import * as React from "react";
import { useSequenceStore } from "@/modules/sequence/store";
import { RichEmailEditor } from "@/components/editor/RichEmailEditor";
import { SequenceBlock, SequenceBlockType } from "@/modules/sequence/types";
import {
  DndContext,
  closestCenter,
  useSensors,
  PointerSensor,
  useSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

const paletteBlocks: { id: string; type: SequenceBlockType; label: string }[] =
  [
    { id: "email", type: "email", label: "Email" },
    { id: "wait", type: "wait", label: "Wait" },
    { id: "sms", type: "sms", label: "SMS" },
    { id: "branch", type: "branch", label: "Branch" },
  ];

export default function Sequence() {
  const sensors = useSensors(useSensor(PointerSensor));
  const {
    draft,
    addBlock,
    removeBlock,
    reorderBlocks,
    updateBlock,
    rename,
    reset,
  } = useSequenceStore();
  const [saving, setSaving] = React.useState(false);
  const [showIds, setShowIds] = React.useState(false);

  const onInsert = (t: string) => addBlock(t as SequenceBlockType);
  const onReorderPalette = () => {}; // palette static for now

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = draft.blocks.findIndex((b) => b.id === active.id);
      const newIdx = draft.blocks.findIndex((b) => b.id === over.id);
      if (oldIdx >= 0 && newIdx >= 0) reorderBlocks(oldIdx, newIdx);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      // Placeholder: POST to /api/app/sequences (to implement server side later)
      await fetch("/api/app/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name, blocks: draft.blocks }),
      });
    } catch (e) {
      console.warn("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  const BlockEditor: React.FC<{ block: SequenceBlock }> = ({ block }) => {
    switch (block.type) {
      case "email":
        return (
          <div className="space-y-2">
            <TextField
              label="Subject"
              value={(block as any).subject}
              onChange={(e) =>
                updateBlock(block.id, { subject: e.target.value } as any)
              }
            />
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-600">
                Body
              </label>
              <RichEmailEditor
                value={(block as any).body}
                onChange={(html) =>
                  updateBlock(block.id, { body: html } as any)
                }
                placeholder="Write the email content..."
              />
            </div>
          </div>
        );
      case "wait":
        return (
          <div className="flex items-end gap-3">
            <TextField
              label="Duration (hrs)"
              type="number"
              value={(block as any).durationHours}
              onChange={(e) =>
                updateBlock(block.id, {
                  durationHours: Number(e.target.value),
                } as any)
              }
            />
          </div>
        );
      case "sms":
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-600">
              Message
            </label>
            <RichEmailEditor
              value={(block as any).message}
              onChange={(html, plain) =>
                updateBlock(block.id, { message: html } as any)
              }
              placeholder="Compose SMS (rich formatting will be simplified)"
              minHeight={120}
            />
            <p className="text-[10px] text-neutral-500">
              Rich formatting will be stripped when sending SMS.
            </p>
          </div>
        );
      case "branch":
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-600">
              Condition
            </label>
            <textarea
              className="min-h-[60px] w-full rounded-lg border border-neutral-300 p-2 text-sm font-mono text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/10"
              value={(block as any).condition}
              onChange={(e) =>
                updateBlock(block.id, { condition: e.target.value } as any)
              }
            />
            <p className="text-[10px] text-neutral-500">
              Example: contact.signup_source == 'ad'
            </p>
          </div>
        );
    }
  };

  return (
    <AppShell>
      <Container size="xl" className="space-y-6 pb-32">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Sequences</h1>
            <Input
              placeholder="Sequence name"
              value={draft.name}
              onChange={(e) => rename(e.target.value)}
              className="max-w-sm bg-white/95 dark:bg-neutral-800/90 border border-neutral-300 dark:border-neutral-500 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-400 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reset()}
              className="font-medium text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-500"
            >
              Reset
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setShowIds((v) => !v)}
              className="font-medium text-neutral-800 dark:text-neutral-100"
            >
              {showIds ? "Hide IDs" : "Show IDs"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveDraft}
              disabled={saving}
              className="font-semibold tracking-wide"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <BlocksPalette
              items={paletteBlocks}
              onReorder={onReorderPalette}
              onInsert={onInsert}
              title="Blocks"
            />
          </div>
          <div className="col-span-9 space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-medium mb-3 text-neutral-600 flex items-center justify-between">
                <span>Sequence Flow</span>
                <span className="text-[10px] font-normal text-neutral-400">
                  {draft.blocks.length} block
                  {draft.blocks.length === 1 ? "" : "s"}
                </span>
              </h2>
              {draft.blocks.length === 0 && (
                <p className="text-xs text-neutral-500">
                  Add blocks from the left palette to start designing your
                  sequence.
                </p>
              )}
              {draft.blocks.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={draft.blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-3">
                      {draft.blocks.map((b, idx) => (
                        <li
                          key={b.id}
                          id={b.id}
                          className="group relative rounded-xl border bg-white dark:bg-neutral-900/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/60"
                        >
                          <div className="flex items-start gap-3 p-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium capitalize">
                                  {idx + 1}. {b.label}
                                </p>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                  {showIds && (
                                    <span className="text-[10px] rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-500">
                                      {b.id}
                                    </span>
                                  )}
                                  <button
                                    className="text-xs text-red-600 hover:underline"
                                    onClick={() => removeBlock(b.id)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <BlockEditor block={b} />
                            </div>
                            <div className="mt-1 cursor-grab select-none rounded-md border px-2 py-1 text-[10px] text-neutral-500 group-hover:bg-neutral-100">
                              Drag
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
