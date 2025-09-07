import { create } from "zustand";
import type { PageDoc, Block } from "@/types/PageDoc";

type State = {
  doc: PageDoc | null;
  device: "desktop" | "tablet" | "mobile";
  dirty: boolean;
  /** Snapshot of last saved state to compute diffs */
  originalDoc: PageDoc | null;
  selectedIndex: number | null;
  history: PageDoc[];
  future: PageDoc[];
  saving: boolean;
};
type Actions = {
  setDoc(d: PageDoc): void;
  addBlock(b: Block): void;
  insertBlock(i: number, b: Block): void;
  updateBlock(i: number, b: Block): void;
  moveBlock(from: number, to: number): void;
  reorderBlocks(ids: string[]): void; // ids correspond to stringified indices prior to reorder
  removeBlock(i: number): void;
  setDevice(d: State["device"]): void;
  markSaved(): void;
  setSelected(i: number | null): void;
  undo(): void;
  redo(): void;
  beginSaving(): void;
  endSaving(): void;
};

export const usePageStore = create<State & Actions>((set, get) => ({
  doc: null,
  device: "desktop",
  dirty: false,
  originalDoc: null,
  selectedIndex: null,
  history: [],
  future: [],
  saving: false,
  setDoc: (d) => set({ doc: d, originalDoc: d, dirty: false }),
  addBlock: (b) =>
    set((s) => {
      // If doc hasn't loaded yet, create a temporary stub so the user action isn't lost.
      if (!s.doc) {
        const now = new Date().toISOString();
        return {
          doc: {
            id: "temp",
            title: "Untitled",
            slug: "untitled",
            theme: { primary: "#0EA5A4", fontScale: 1, spacing: "base" },
            blocks: [b],
            version: 1,
            updatedAt: now,
            status: "draft",
          },
          dirty: true,
          history: s.doc ? [...s.history, s.doc] : s.history,
        } as any;
      }
      return {
        doc: { ...s.doc, blocks: [...s.doc.blocks, b] },
        dirty: true,
        history: [...s.history, s.doc],
        future: [],
      };
    }),
  insertBlock: (i, b) =>
    set((s) => {
      if (!s.doc) return {} as any;
      const blocks = s.doc.blocks.slice();
      const index = Math.min(Math.max(i, 0), blocks.length);
      blocks.splice(index, 0, b);
      return {
        doc: { ...s.doc, blocks },
        dirty: true,
        history: [...s.history, s.doc],
        future: [],
      };
    }),
  updateBlock: (i, b) =>
    set((s) => {
      if (!s.doc) return {} as any;
      const blocks = s.doc.blocks.slice();
      blocks[i] = b;
      return {
        doc: { ...s.doc, blocks },
        dirty: true,
        history: [...s.history, s.doc],
        future: [],
      };
    }),
  moveBlock: (from, to) =>
    set((s) => {
      if (!s.doc) return {} as any;
      const blocks = s.doc.blocks.slice();
      const [m] = blocks.splice(from, 1);
      blocks.splice(to, 0, m);
      return {
        doc: { ...s.doc, blocks },
        dirty: true,
        history: [...s.history, s.doc],
        future: [],
      };
    }),
  reorderBlocks: (ids) =>
    set((s) => {
      if (!s.doc) return {} as any;
      const newBlocks = ids
        .map((id) => s.doc!.blocks[parseInt(id, 10)])
        .filter(Boolean);
      return {
        doc: { ...s.doc, blocks: newBlocks },
        dirty: true,
        history: [...s.history, s.doc],
        future: [],
      };
    }),
  removeBlock: (i) =>
    set((s) => {
      if (!s.doc) return {} as any;
      const blocks = s.doc.blocks.slice();
      blocks.splice(i, 1);
      return {
        doc: { ...s.doc, blocks },
        dirty: true,
        history: [...s.history, s.doc],
        future: [],
      };
    }),
  setDevice: (d) => set({ device: d }),
  markSaved: () => set({ dirty: false, originalDoc: get().doc }),
  setSelected: (i) => set({ selectedIndex: i }),
  undo: () =>
    set((s) => {
      if (!s.history.length || !s.doc) return {} as any;
      const prev = s.history[s.history.length - 1];
      return {
        doc: prev,
        history: s.history.slice(0, -1),
        future: [s.doc, ...s.future],
        dirty: true,
      };
    }),
  redo: () =>
    set((s) => {
      if (!s.future.length || !s.doc) return {} as any;
      const next = s.future[0];
      return {
        doc: next,
        future: s.future.slice(1),
        history: [...s.history, s.doc],
        dirty: true,
      };
    }),
  beginSaving: () => set({ saving: true }),
  endSaving: () => set({ saving: false }),
}));
