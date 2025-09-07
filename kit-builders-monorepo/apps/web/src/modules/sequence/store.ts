import { create } from "zustand";
// @ts-ignore - type mismatch due to older zustand middleware typing; safe runtime usage
import { persist } from "zustand/middleware";
import type { SequenceDraft, SequenceBlock, SequenceBlockType } from "./types";
import { makeBlock } from "./types";

interface SequenceState {
  draft: SequenceDraft;
  addBlock: (type: SequenceBlockType) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (from: number, to: number) => void;
  updateBlock: (id: string, patch: Partial<SequenceBlock>) => void;
  rename: (name: string) => void;
  reset: () => void;
}

const newDraft = (): SequenceDraft => ({
  id: "local-draft",
  name: "Untitled Sequence",
  blocks: [],
  updatedAt: Date.now(),
});

export const useSequenceStore = create<SequenceState>()(
  (persist as any)(
    (set: any) => ({
      draft: newDraft(),
      addBlock: (type: SequenceBlockType) =>
        set((s: SequenceState) => ({
          draft: {
            ...s.draft,
            blocks: [...s.draft.blocks, makeBlock(type)],
            updatedAt: Date.now(),
          },
        })),
      removeBlock: (id: string) =>
        set((s: SequenceState) => ({
          draft: {
            ...s.draft,
            blocks: s.draft.blocks.filter((b: SequenceBlock) => b.id !== id),
            updatedAt: Date.now(),
          },
        })),
      reorderBlocks: (from: number, to: number) =>
        set((s: SequenceState) => {
          const copy = [...s.draft.blocks];
          const [m] = copy.splice(from, 1);
          copy.splice(to, 0, m);
          return { draft: { ...s.draft, blocks: copy, updatedAt: Date.now() } };
        }),
      updateBlock: (id: string, patch: Partial<SequenceBlock>) =>
        set((s: SequenceState) => ({
          draft: {
            ...s.draft,
            blocks: s.draft.blocks.map((b: SequenceBlock) =>
              b.id === id ? ({ ...b, ...patch } as SequenceBlock) : b,
            ),
            updatedAt: Date.now(),
          },
        })),
      rename: (name: string) =>
        set((s: SequenceState) => ({
          draft: { ...s.draft, name, updatedAt: Date.now() },
        })),
      reset: () => set({ draft: newDraft() }),
    }),
    { name: "sequence-draft" },
  ),
);
