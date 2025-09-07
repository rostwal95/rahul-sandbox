"use client";
import { useEffect, useMemo, useState } from "react";
import { usePageStore } from "@/stores/pageStore";
import type { PageDoc, Block } from "@/types/PageDoc";
import {
  Button,
  BlocksPalette,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@kit/design-system";
import { PublishModal } from "@/components/editor/PublishModal";
import { Hero } from "@/components/blocks/Hero";
import { Testimonial } from "@/components/blocks/Testimonial";
import { Pricing } from "@/components/blocks/Pricing";
import { CTA } from "@/components/blocks/CTA";
import { cn } from "@kit/design-system/utils/cn";
import {
  PanelLeft,
  Laptop,
  Tablet,
  Smartphone,
  Plus,
  Save,
  MoveUp,
  MoveDown,
  Trash2,
} from "lucide-react";

// Temporary mock fetch (replace with real API calls later)
async function fetchPage(id: string): Promise<PageDoc> {
  return {
    id,
    title: "Sample Landing Page",
    slug: "sample",
    theme: { primary: "#6366f1", fontScale: 1, spacing: "base" },
    blocks: [
      {
        type: "hero",
        props: {
          headline: "Build faster",
          sub: "Ship landing pages with blocks",
          cta: { text: "Get Started", href: "#" },
          align: "center",
        },
      },
      {
        type: "cta",
        props: {
          headline: "Ready to launch?",
          sub: "Deploy in minutes",
          cta: { text: "Deploy", href: "#" },
        },
      },
    ],
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

export default function PageEditor({ params }: { params: { id: string } }) {
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
  } = usePageStore();
  const [publishOpen, setPublishOpen] = useState(false);

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

  useEffect(() => {
    if (!doc) {
      fetchPage(params.id).then(setDoc);
    }
  }, [doc, params.id, setDoc]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          dirty={dirty}
          device={device}
          setDevice={setDevice}
          onPublish={() => setPublishOpen(true)}
        />
        <div className="flex flex-1 overflow-hidden">
          <Palette onAdd={addBlock} onReorder={reorderBlocks} />
          <Canvas />
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
}: {
  dirty: boolean;
  device: string;
  setDevice: (d: any) => void;
  onPublish: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b px-4 h-12 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
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
        <Button size="sm" variant="outline" onClick={onPublish}>
          <Save className="h-4 w-4 mr-1" />
          Publish
        </Button>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="w-48 border-r p-3 hidden md:block">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
        Navigation
      </div>
      <ul className="space-y-1 text-sm">
        <li className="font-medium">Blocks</li>
        <li className="text-muted-foreground">Themes</li>
        <li className="text-muted-foreground">History</li>
      </ul>
    </div>
  );
}

function Palette({
  onAdd,
  onReorder,
}: {
  onAdd: (b: Block) => void;
  onReorder: (ids: string[]) => void;
}) {
  const { doc } = usePageStore();
  const addItems = [
    { id: "add-hero", type: "hero", label: "Hero" },
    { id: "add-testimonial", type: "testimonial", label: "Testimonial" },
    { id: "add-pricing", type: "pricing", label: "Pricing" },
    { id: "add-cta", type: "cta", label: "CTA" },
  ];
  const structureItems = (doc?.blocks || []).map((b, i) => ({
    id: String(i),
    type: b.type,
    label: `${i + 1}. ${b.type}`,
  }));
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
              break;
          }
        }}
      />
      <div className="mt-8" />
      <BlocksPalette
        title="Structure"
        items={structureItems}
        onReorder={(items) => onReorder(items.map((i: any) => i.id))}
      />
    </div>
  );
}

function Canvas() {
  const { doc, device, moveBlock, removeBlock, selectedIndex, setSelected } =
    usePageStore();
  return (
    <div className="flex-1 overflow-y-auto py-10 px-8">
      <div
        className={cn(
          "mx-auto transition-all space-y-10",
          device === "desktop" && "max-w-[1100px]",
          device === "tablet" && "max-w-2xl",
          device === "mobile" && "max-w-sm",
        )}
      >
        {!doc && <div className="text-sm text-muted-foreground">Loading…</div>}
        {doc?.blocks.map((b, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "group relative rounded-xl border bg-background shadow-sm mb-6 p-6 cursor-pointer",
              selectedIndex === i && "ring-2 ring-teal-500",
            )}
          >
            <div className="absolute -top-3 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <Button
                size="sm"
                variant="subtle"
                onClick={() => moveBlock(i, Math.max(0, i - 1))}
              >
                <MoveUp className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => moveBlock(i, i + 1)}
              >
                <MoveDown className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="danger" onClick={() => removeBlock(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <RenderBlock block={b} />
          </div>
        ))}
        <Footer />
      </div>
    </div>
  );
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return <Hero {...block.props} />;
    case "testimonial":
      return <Testimonial {...block.props} />;
    case "pricing":
      return <Pricing {...block.props} />;
    case "cta":
      return <CTA {...block.props} />;
  }
  return null;
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

function Inspector() {
  const { doc, selectedIndex } = usePageStore();
  const block = selectedIndex != null ? doc?.blocks[selectedIndex] : null;
  return (
    <div className="w-72 border-l p-4 hidden xl:block space-y-4">
      <div className="font-medium">Inspector</div>
      {!block && (
        <div className="text-xs text-muted-foreground">
          Select a block to edit its properties.
        </div>
      )}
      {block && (
        <div className="text-xs text-muted-foreground">
          Basic inspector coming soon for <strong>{block.type}</strong>.
        </div>
      )}
    </div>
  );
}
