import { create } from "zustand";
import { BlockType } from "../models";

interface HistoryState {
  past: BlockType[][];
  present: BlockType[];
  future: BlockType[][];
}

interface BuilderState {
  pageId?: string;
  blocks: BlockType[];
  selectedId?: string;
  hoveredId?: string;
  outlineMode: boolean;
  history: HistoryState;
  select: (id?: string) => void;
  hover: (id?: string) => void;
  setBlocks: (blocks: BlockType[], pushHistory?: boolean) => void;
  insertBlock: (block: BlockType, index?: number) => void;
  updateBlock: (id: string, patch: Partial<BlockType>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, to: number) => void;
  toggleOutline: () => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
}

const MAX_HISTORY = 100;

export const useBuilder = create<BuilderState>((set, get) => ({
  blocks: [],
  outlineMode: false,
  history: { past: [], present: [], future: [] },
  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoveredId: id }),
  setBlocks: (blocks, pushHistory = true) => {
    const { history } = get();
    if (pushHistory) {
      const newPast = [...history.past, history.present].slice(-MAX_HISTORY);
      set({ blocks, history: { past: newPast, present: blocks, future: [] } });
    } else {
      set({ blocks, history: { ...history, present: blocks } });
    }
  },
  insertBlock: (block, index) => {
    const blocks = [...get().blocks];
    const i = index === undefined ? blocks.length : index;
    blocks.splice(i, 0, block);
    get().setBlocks(blocks);
  },
  updateBlock: (id, patch) => {
    const blocks = get().blocks.map((b) =>
      b.id === id ? ({ ...b, ...patch } as any) : b
    );
    get().setBlocks(blocks);
  },
  removeBlock: (id) => {
    const blocks = get().blocks.filter((b) => b.id !== id);
    get().setBlocks(blocks);
    if (get().selectedId === id) set({ selectedId: undefined });
  },
  moveBlock: (id, to) => {
    const blocks = [...get().blocks];
    const fromIndex = blocks.findIndex((b) => b.id === id);
    if (fromIndex === -1) return;
    const [item] = blocks.splice(fromIndex, 1);
    blocks.splice(Math.max(0, Math.min(to, blocks.length)), 0, item);
    get().setBlocks(blocks);
  },
  toggleOutline: () => set((s) => ({ outlineMode: !s.outlineMode })),
  undo: () => {
    const { history } = get();
    if (!history.past.length) return;
    const past = [...history.past];
    const previous = past.pop()!;
    const future = [history.present, ...history.future];
    set({ blocks: previous, history: { past, present: previous, future } });
  },
  redo: () => {
    const { history } = get();
    if (!history.future.length) return;
    const [next, ...rest] = history.future;
    const past = [...history.past, history.present].slice(-MAX_HISTORY);
    set({ blocks: next, history: { past, present: next, future: rest } });
  },
  resetHistory: () =>
    set((s) => ({ history: { past: [], present: s.blocks, future: [] } })),
}));
