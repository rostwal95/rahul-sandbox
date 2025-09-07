"use client";
import { useToast } from "@/components/ToastProvider";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Hero } from "@/components/blocks/Hero";
import { Testimonial } from "@/components/blocks/Testimonial";
import { Pricing } from "@/components/blocks/Pricing";
import { CTA } from "@/components/blocks/CTA";
import { Subscribe } from "@/components/blocks/Subscribe";
import { usePageStore } from "@/stores/pageStore";
import type { PageDoc, Block as EditorBlock } from "@/types/PageDoc";
import {
  BlocksPalette,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@kit/design-system";
import { Laptop, Tablet, Smartphone, Save, MoveUp, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

function adaptApiBlocks(blocks: any[]): EditorBlock[] {
  const out: EditorBlock[] = [];
  for (const raw of blocks || []) {
    const kind = raw.kind || raw.type;
    const data = raw.data_json?.data || raw.data || raw.props || {};
    if (kind === "hero") {
      out.push({
        type: "hero",
        props: {
          headline: data.headline || "Your headline",
          sub: data.sub || data.description || "",
          cta: data.cta || { text: "Get Started", href: "#" },
          align: data.align || "center",
        },
      });
    } else if (kind === "testimonial") {
      out.push({
        type: "testimonial",
        props: {
          quote: data.quote || data.text || "Amazing product.",
          author: data.author || "Jane Doe",
          role: data.role || "Founder",
        },
      });
    } else if (kind === "pricing") {
      out.push({
        type: "pricing",
        props: {
          tiers: Array.isArray(data.tiers) ? data.tiers : data.tiers || [],
          highlight: typeof data.highlight === "number" ? data.highlight : 1,
        },
      });
    } else if (kind === "cta") {
      out.push({
        type: "cta",
        props: {
          headline: data.headline || data.text || "Call to action",
          sub: data.sub || data.description || "",
          cta: data.cta || { text: "Get Started", href: "#" },
        },
      });
    } else if (kind === "subscribe") {
      out.push({
        type: "subscribe",
        props: {
          headline: data.headline || "Stay in the loop",
          sub: data.sub || data.description || "",
          placeholder: data.placeholder || "you@example.com",
          consent: data.consent || "We respect your privacy.",
          cta: data.cta || { text: "Subscribe" },
        },
      });
    }
  }
  return out;
}

// local small helpers
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function toTransform(t: any) {
  if (!t) return undefined;
  return `translate3d(${t.x}px, ${t.y}px, 0)`;
}

async function fetchPageDoc(id: string): Promise<PageDoc> {
  const res = await fetch(`/api/app/pages/${id}?with=blocks`);
  const page = await res.json();
  const blocks = page.blocks || [];
  const adapted = adaptApiBlocks(blocks).map((b: any, i: number) => ({
    ...b,
    _id: blocks[i]?.id,
  }));
  return {
    id: String(page.id),
    title: page.slug || page.title || "Untitled",
    slug: page.slug || "untitled",
    theme: { primary: "#0EA5A4", fontScale: 1, spacing: "base" },
    blocks: adapted,
    version: page.version || 1,
    updatedAt: page.updated_at || new Date().toISOString(),
    status: page.status || "draft",
  } as PageDoc;
}

// Accept Next.js 15 Promise-based params while remaining compatible with earlier direct object.
// Use broad `any` for params to appease Next.js PageProps inference while still safely unwrapping.
export default function PageEditor({ params }: { params: any }) {
  const {
    doc,
    setDoc,
    device,
    setDevice,
    dirty,
    moveBlock,
    removeBlock,
    addBlock,
    reorderBlocks,
    selectedIndex,
    setSelected,
    originalDoc,
    markSaved,
    undo,
    redo,
  } = usePageStore();
  const [publishOpen, setPublishOpen] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null!);
  const { push } = useToast();

  // Debounced autosave for blocks only (persist block set + page metadata)
  useEffect(() => {
    if (!doc || !dirty || !doc.id || doc.id === "temp") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/app/pages/${doc.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            page: { theme_json: doc.theme, status: doc.status },
          }),
        });
        const existingIds = new Set<string>();
        for (let order = 0; order < doc.blocks.length; order++) {
          const blk: any = doc.blocks[order];
          if (blk._id) {
            existingIds.add(String(blk._id));
            await fetch(`/api/app/pages/${doc.id}/blocks/${blk._id}`, {
              method: "PATCH",
              body: JSON.stringify({
                block: {
                  kind: blk.type,
                  order,
                  data_json: { data: blk.props },
                },
              }),
            });
          } else {
            const created = await fetch(`/api/app/pages/${doc.id}/blocks`, {
              method: "POST",
              body: JSON.stringify({
                block: {
                  kind: blk.type,
                  order,
                  data_json: { data: blk.props },
                },
              }),
            })
              .then((r) => r.json())
              .catch(() => null);
            if (created?.id) blk._id = created.id;
            existingIds.add(String(created?.id));
          }
        }
        if (originalDoc) {
          const oldIds = (originalDoc.blocks as any[])
            .map((b) => b._id)
            .filter(Boolean);
          for (const oid of oldIds) {
            if (oid && !existingIds.has(String(oid))) {
              await fetch(`/api/app/pages/${doc.id}/blocks/${oid}`, {
                method: "DELETE",
              });
            }
          }
        }
        markSaved();
      } catch (e) {
        push({
          variant: "error",
          title: "Autosave failed",
          message: e instanceof Error ? e.message : "Network error",
        });
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [doc, dirty, markSaved, originalDoc]);

  const diff = useMemo(() => {
    if (!originalDoc || !doc) return { added: [], removed: [], edited: [] };
    const oldKinds = originalDoc.blocks.map((b, i) => `${i}:${b.type}`);
    const newKinds = doc.blocks.map((b, i) => `${i}:${b.type}`);
    const added = newKinds
      .filter((k) => !oldKinds.includes(k))
      .map((k) => k.split(":")[1]);
    const removed = oldKinds
      .filter((k) => !newKinds.includes(k))
      .map((k) => k.split(":")[1]);
    const edited: string[] = [];
    doc.blocks.forEach((b, i) => {
      const ob = originalDoc.blocks[i];
      if (
        ob &&
        ob.type === b.type &&
        JSON.stringify(ob.props) !== JSON.stringify(b.props)
      ) {
        edited.push(b.type);
      }
    });
    return { added, removed, edited };
  }, [doc, originalDoc]);

  // Unwrap route params (Next.js 15 Promise-based params). Always use React.use when available to avoid warning.
  let paramId: string | undefined;
  if (
    typeof params === "object" &&
    params &&
    typeof (params as any).then === "function" &&
    (React as any).use
  ) {
    // @ts-ignore experimental React.use for promises
    const resolved = (React as any).use(params);
    paramId = resolved?.id;
  } else if (typeof params === "object" && params) {
    // Legacy direct object
    paramId = (params as any).id;
  }

  useEffect(() => {
    if (!doc && paramId) {
      fetchPageDoc(paramId)
        .then(setDoc)
        .catch(() => {});
    }
  }, [doc, paramId, setDoc]);

  // Keyboard shortcuts: Backspace/Delete to remove selected block
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!doc) return;
      // Undo / Redo shortcuts (Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
          push({
            variant: "info",
            title: "Redo",
            message: "Re-applied change",
          });
        } else {
          undo();
          push({
            variant: "info",
            title: "Undo",
            message: "Reverted last change",
          });
        }
        return;
      }
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        selectedIndex != null
      ) {
        e.preventDefault();
        removeBlock(selectedIndex);
        push({
          variant: "success",
          title: "Block removed",
          message: "Block deleted.",
        });
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doc, selectedIndex, removeBlock, setSelected]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F9FAFB]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          dirty={dirty}
          device={device}
          setDevice={setDevice}
          onPublish={() => setPublishOpen(true)}
          undo={() => {
            undo();
            push({
              variant: "info",
              title: "Undo",
              message: "Reverted last change",
            });
          }}
          redo={() => {
            redo();
            push({
              variant: "info",
              title: "Redo",
              message: "Re-applied change",
            });
          }}
        />
        <div className="flex flex-1 overflow-hidden">
          <Palette onAdd={addBlock} onReorder={reorderBlocks} />
          <Canvas canvasRef={canvasRef} />
          <Inspector />
        </div>
      </div>
      {doc && (
        <PublishModal
          open={publishOpen}
          onOpenChange={setPublishOpen}
          // @ts-ignore
          doc={doc}
          diff={diff}
          onConfirm={() => {
            markSaved();
            setPublishOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TopBar({
  dirty,
  device,
  setDevice,
  onPublish,
  undo,
  redo,
}: {
  dirty: boolean;
  device: string;
  setDevice: (d: any) => void;
  onPublish: () => void;
  undo: () => void;
  redo: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b px-4 h-12 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="font-medium">Page Editor</div>
      {dirty && (
        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
          Unsaved
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          variant={device === "desktop" ? "solid" : "ghost"}
          onClick={() => setDevice("desktop")}
        >
          <Laptop className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={device === "tablet" ? "solid" : "ghost"}
          onClick={() => setDevice("tablet")}
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={device === "mobile" ? "solid" : "ghost"}
          onClick={() => setDevice("mobile")}
        >
          <Smartphone className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={undo} disabled={!dirty}>
          <span className="text-xs">Undo</span>
        </Button>
        <Button size="sm" variant="outline" onClick={redo} disabled={!dirty}>
          <span className="text-xs">Redo</span>
        </Button>
        <Button size="sm" variant="outline" onClick={onPublish}>
          <Save className="h-4 w-4 mr-1" />
          Publish
        </Button>
      </div>
    </div>
  );
}

function Palette({
  onAdd,
  onReorder,
}: {
  onAdd: (b: EditorBlock) => void;
  onReorder: (ids: string[]) => void;
}) {
  const { push } = useToast();
  const addItems = [
    { id: "add-hero", type: "hero", label: "Hero" },
    { id: "add-testimonial", type: "testimonial", label: "Testimonial" },
    { id: "add-pricing", type: "pricing", label: "Pricing" },
    { id: "add-cta", type: "cta", label: "CTA" },
    { id: "add-subscribe", type: "subscribe", label: "Subscribe" },
  ];
  return (
    <div className="w-60 border-r p-4 overflow-y-auto hidden lg:block">
      <BlocksPalette
        title="Add"
        items={addItems}
        onReorder={() => {}}
        onInsert={(t) => {
          switch (t) {
            case "hero":
              onAdd({
                type: "hero",
                props: {
                  headline: "Your headline",
                  sub: "Supporting copy",
                  cta: { text: "Get Started", href: "#" },
                  align: "center",
                },
              });
              push({
                variant: "success",
                title: "Block added",
                message: "hero inserted",
              });
              break;
            case "testimonial":
              onAdd({
                type: "testimonial",
                props: {
                  quote: "This product is amazing.",
                  author: "Jane Doe",
                  role: "Founder, Acme",
                },
              });
              push({
                variant: "success",
                title: "Block added",
                message: "testimonial inserted",
              });
              break;
            case "pricing":
              onAdd({
                type: "pricing",
                props: {
                  tiers: [
                    {
                      name: "Starter",
                      price: 9,
                      features: ["1 project", "Community support"],
                      cta: { text: "Choose", href: "#" },
                    },
                    {
                      name: "Pro",
                      price: 29,
                      features: ["Unlimited", "Priority support"],
                      cta: { text: "Choose", href: "#" },
                    },
                    {
                      name: "Team",
                      price: 79,
                      features: ["Team features", "SLA"],
                      cta: { text: "Choose", href: "#" },
                    },
                  ],
                  highlight: 1,
                },
              });
              push({
                variant: "success",
                title: "Block added",
                message: "pricing inserted",
              });
              break;
            case "cta":
              onAdd({
                type: "cta",
                props: {
                  headline: "Ready to launch?",
                  sub: "Start your trial in minutes",
                  cta: { text: "Start Free", href: "#" },
                },
              });
              push({
                variant: "success",
                title: "Block added",
                message: "cta inserted",
              });
              break;
            case "subscribe":
              onAdd({
                type: "subscribe",
                props: {
                  headline: "Stay in the loop",
                  sub: "Get product updates and insights.",
                  placeholder: "you@example.com",
                  consent: "We respect your privacy.",
                  cta: { text: "Subscribe" },
                },
              });
              push({
                variant: "success",
                title: "Block added",
                message: "subscribe inserted",
              });
              break;
          }
        }}
      />
    </div>
  );
}

function EditableBlock({
  block,
  index,
}: {
  block: EditorBlock;
  index: number;
}) {
  const { updateBlock } = usePageStore();
  const onText = (key: string) => (e: React.FocusEvent<HTMLElement>) => {
    const text = (e.currentTarget.textContent || "").trim();
    updateBlock(index, {
      ...block,
      props: { ...block.props, [key]: text },
    } as any);
  };
  if (block.type === "hero") {
    return (
      <div className="space-y-4">
        <h1
          className="text-4xl font-bold focus:outline-none"
          role="textbox"
          aria-label="Hero headline"
          contentEditable
          suppressContentEditableWarning
          onBlur={onText("headline")}
        >
          {block.props.headline}
        </h1>
        {block.props.sub && (
          <p
            className="text-zinc-600 max-w-prose focus:outline-none"
            role="textbox"
            aria-label="Hero sub text"
            contentEditable
            suppressContentEditableWarning
            onBlur={onText("sub")}
          >
            {block.props.sub}
          </p>
        )}
      </div>
    );
  }
  if (block.type === "testimonial") {
    return (
      <blockquote className="space-y-2">
        <p
          className="italic focus:outline-none"
          role="textbox"
          aria-label="Testimonial quote"
          contentEditable
          suppressContentEditableWarning
          onBlur={onText("quote")}
        >
          {block.props.quote}
        </p>
        <footer
          className="text-sm text-zinc-500 focus:outline-none"
          role="textbox"
          aria-label="Testimonial author"
          contentEditable
          suppressContentEditableWarning
          onBlur={onText("author")}
        >
          {block.props.author}
        </footer>
      </blockquote>
    );
  }
  if (block.type === "cta") {
    return (
      <div className="space-y-2">
        <h2
          className="text-2xl font-semibold focus:outline-none"
          role="textbox"
          aria-label="CTA headline"
          contentEditable
          suppressContentEditableWarning
          onBlur={onText("headline")}
        >
          {block.props.headline}
        </h2>
        {block.props.sub && (
          <p
            className="text-sm text-zinc-600 focus:outline-none"
            role="textbox"
            aria-label="CTA sub text"
            contentEditable
            suppressContentEditableWarning
            onBlur={onText("sub")}
          >
            {block.props.sub}
          </p>
        )}
      </div>
    );
  }
  if (block.type === "subscribe") {
    return (
      <div className="space-y-2">
        {block.props.headline && (
          <h3
            className="text-xl font-medium focus:outline-none"
            role="textbox"
            aria-label="Subscribe headline"
            contentEditable
            suppressContentEditableWarning
            onBlur={onText("headline")}
          >
            {block.props.headline}
          </h3>
        )}
        {block.props.sub && (
          <p
            className="text-sm text-zinc-600 focus:outline-none"
            role="textbox"
            aria-label="Subscribe sub text"
            contentEditable
            suppressContentEditableWarning
            onBlur={onText("sub")}
          >
            {block.props.sub}
          </p>
        )}
      </div>
    );
  }
  if (block.type === "pricing") {
    return <Pricing {...block.props} />; // leave complex editing for later
  }
  return null;
}

function Inspector() {
  const { doc, selectedIndex } = usePageStore();
  const block = selectedIndex != null ? doc?.blocks[selectedIndex] : null;
  return (
    <div className="w-72 border-l p-4 hidden xl:block space-y-4">
      <div className="font-medium">Inspector</div>
      {!block && (
        <div className="text-xs text-zinc-500">
          Select a block to edit its properties.
        </div>
      )}
      {block && (
        <div className="text-xs text-zinc-500">
          Basic inspector coming soon for <strong>{block.type}</strong>.
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="rounded-2xl bg-zinc-50 text-zinc-600 text-sm flex flex-wrap items-center justify-center gap-6 py-6 border border-zinc-200">
      <a href="#" className="hover:text-zinc-900 transition-colors">
        Docs
      </a>
      <a href="#" className="hover:text-zinc-900 transition-colors">
        Support
      </a>
      <a href="#" className="hover:text-zinc-900 transition-colors">
        Account
      </a>
    </footer>
  );
}

// Drag & drop canvas and sortable wrapper
function Canvas({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement> }) {
  const {
    doc,
    device,
    removeBlock,
    selectedIndex,
    setSelected,
    reorderBlocks,
    addBlock,
    insertBlock,
  } = usePageStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id && doc) {
      const oldIndex = parseInt(String(active.id), 10);
      const newIndex = parseInt(String(over.id), 10);
      const ids = doc.blocks.map((_, i) => String(i));
      const reordered = arrayMove(ids, oldIndex, newIndex);
      reorderBlocks(reordered);
      setSelected(newIndex);
    }
  };
  return (
    <div ref={canvasRef} className="flex-1 overflow-y-auto py-10 px-8">
      <div
        className={cn(
          "mx-auto transition-all space-y-10",
          device === "desktop" && "max-w-[1100px]",
          device === "tablet" && "max-w-2xl",
          device === "mobile" && "max-w-sm",
        )}
      >
        {!doc && <div className="text-sm text-zinc-500">Loading…</div>}
        {doc && doc.blocks.length === 0 && (
          <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4">
            <p className="text-sm text-zinc-600">
              No blocks yet. Add your first block.
            </p>
            <AddBlockMenu onAdd={(b) => addBlock(b)} />
          </div>
        )}
        {doc && doc.blocks.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={doc.blocks.map((_, i) => String(i))}
              strategy={verticalListSortingStrategy}
            >
              {doc.blocks.map((b, i) => (
                <React.Fragment key={i}>
                  <InlineAdd
                    index={i}
                    onInsert={(blk) => {
                      insertBlock(i, blk);
                      // defer to next frame then scroll new insertion into view
                      requestAnimationFrame(() => {
                        const el =
                          canvasRef.current?.querySelectorAll("[data-block]")[
                            i
                          ];
                        if (el && "scrollIntoView" in el)
                          (el as any).scrollIntoView({
                            block: "center",
                            behavior: "smooth",
                          });
                      });
                    }}
                  />
                  <SortableBlockWrapper
                    id={String(i)}
                    index={i}
                    selected={selectedIndex === i}
                    onSelect={() => setSelected(i)}
                    onRemove={() => removeBlock(i)}
                    block={b}
                  />
                  {i === doc.blocks.length - 1 && (
                    <InlineAdd
                      index={i + 1}
                      onInsert={(blk) => {
                        insertBlock(i + 1, blk);
                        requestAnimationFrame(() => {
                          const el =
                            canvasRef.current?.querySelectorAll("[data-block]")[
                              i + 1
                            ];
                          if (el && "scrollIntoView" in el)
                            (el as any).scrollIntoView({
                              block: "center",
                              behavior: "smooth",
                            });
                        });
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </SortableContext>
          </DndContext>
        )}
        <Footer />
      </div>
    </div>
  );
}

function InlineAdd({
  index,
  onInsert,
}: {
  index: number;
  onInsert: (b: EditorBlock) => void;
}) {
  const { push } = useToast();
  return (
    <div className="flex items-center justify-center -my-2">
      <AddBlockMenu
        inline
        onAdd={(b) => {
          onInsert(b);
          push({
            variant: "success",
            title: "Block added",
            message: b.type + " inserted",
          });
        }}
      />
    </div>
  );
}

function AddBlockMenu({
  onAdd,
  inline,
}: {
  onAdd: (b: EditorBlock) => void;
  inline?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const { push } = useToast();
  const add = (block: EditorBlock) => {
    onAdd(block);
    setOpen(false);
    push({
      variant: "success",
      title: "Block added",
      message: block.type + " inserted",
    });
  };
  const btnClass = cn(
    "text-xs px-3 py-1 flex items-center gap-1 shadow-sm bg-white hover:bg-zinc-50 border rounded-full",
    inline && "opacity-60 hover:opacity-100 -translate-y-1",
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button" className={btnClass}>
          Add block
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden w-[440px]">
        <div className="p-5">
          <DialogHeader>
            <DialogTitle>Add a block</DialogTitle>
            <DialogDescription>
              Select a section type to insert
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <BlockOption
              label="Hero"
              onClick={() =>
                add({
                  type: "hero",
                  props: {
                    headline: "Your headline",
                    sub: "Supporting copy",
                    cta: { text: "Get Started", href: "#" },
                    align: "center",
                  },
                } as any)
              }
            />
            <BlockOption
              label="Testimonial"
              onClick={() =>
                add({
                  type: "testimonial",
                  props: {
                    quote: "Amazing product.",
                    author: "Jane Doe",
                    role: "Founder",
                  },
                } as any)
              }
            />
            <BlockOption
              label="Pricing"
              onClick={() =>
                add({
                  type: "pricing",
                  props: {
                    tiers: [
                      {
                        name: "Starter",
                        price: 9,
                        features: ["1 project", "Community support"],
                        cta: { text: "Choose", href: "#" },
                      },
                      {
                        name: "Pro",
                        price: 29,
                        features: ["Unlimited", "Priority support"],
                        cta: { text: "Choose", href: "#" },
                      },
                    ],
                    highlight: 1,
                  },
                } as any)
              }
            />
            <BlockOption
              label="CTA"
              onClick={() =>
                add({
                  type: "cta",
                  props: {
                    headline: "Ready to launch?",
                    sub: "Start your trial in minutes",
                    cta: { text: "Start Free", href: "#" },
                  },
                } as any)
              }
            />
            <BlockOption
              label="Subscribe"
              onClick={() =>
                add({
                  type: "subscribe",
                  props: {
                    headline: "Stay in the loop",
                    sub: "Get product updates.",
                    placeholder: "you@example.com",
                    consent: "We respect your privacy.",
                    cta: { text: "Subscribe" },
                  },
                } as any)
              }
            />
          </div>
        </div>
        <DialogFooter className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BlockOption({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-1 rounded-lg border p-3 hover:border-teal-500 hover:bg-teal-50 text-left transition text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      <span className="font-medium text-sm">{label}</span>
      <span className="text-[10px] text-zinc-500 group-hover:text-teal-600">
        Insert {label} block
      </span>
    </button>
  );
}

function SortableBlockWrapper({
  id,
  index,
  selected,
  onSelect,
  onRemove,
  block,
}: {
  id: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  block: EditorBlock;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: toTransform(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group relative rounded-xl border bg-background shadow-sm mb-6 p-6 cursor-pointer",
        selected && "ring-2 ring-teal-500",
      )}
      onClick={onSelect}
      data-block
    >
      <div
        className="absolute -top-3 left-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition"
        role="toolbar"
        aria-label="Block actions"
      >
        <Button
          size="sm"
          variant="subtle"
          aria-label="Drag handle"
          {...listeners}
        >
          <MoveUp className="h-3 w-3 rotate-90" />
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove block"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <EditableBlock block={block} index={index} />
    </div>
  );
}

// Minimal publish modal stub (replaces missing original implementation)
function PublishModal({
  open,
  onOpenChange,
  doc,
  diff,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  doc: PageDoc;
  diff: { added: string[]; removed: string[]; edited: string[] };
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">Publish changes</h2>
        <div className="text-sm text-zinc-600 space-y-2 max-h-60 overflow-y-auto">
          <div>
            <strong>Page:</strong> {doc.title}
          </div>
          <ChangesList label="Added" items={diff.added} empty="No new blocks" />
          <ChangesList label="Edited" items={diff.edited} empty="No edits" />
          <ChangesList
            label="Removed"
            items={diff.removed}
            empty="No removals"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm}>
            Confirm Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChangesList({
  label,
  items,
  empty,
}: {
  label: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <div className="font-medium text-xs uppercase tracking-wide mb-1 text-zinc-500">
        {label}
      </div>
      {items.length === 0 && (
        <div className="text-xs text-zinc-400">{empty}</div>
      )}
      {items.length > 0 && (
        <ul className="text-xs list-disc pl-4 space-y-0.5">
          {items.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
