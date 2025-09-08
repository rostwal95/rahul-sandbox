import { create } from "zustand";
import { ThemeToken, ThemeTokenType } from "../models";

interface ThemeState {
  themes: ThemeTokenType[];
  currentId?: string;
  darkPreview: boolean;
  addTheme: (t: ThemeTokenType) => void;
  updateTheme: (id: string, patch: Partial<ThemeTokenType>) => void;
  removeTheme: (id: string) => void;
  setCurrent: (id: string) => void;
  toggleDark: () => void;
  injectCssVars: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  themes: [],
  darkPreview: false,
  addTheme: (t) => set((s) => ({ themes: [...s.themes, ThemeToken.parse(t)] })),
  updateTheme: (id, patch) =>
    set((s) => ({
      themes: s.themes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  removeTheme: (id) =>
    set((s) => ({
      themes: s.themes.filter((t) => t.id !== id),
      currentId: s.currentId === id ? undefined : s.currentId,
    })),
  setCurrent: (id) => set({ currentId: id }),
  toggleDark: () => set((s) => ({ darkPreview: !s.darkPreview })),
  injectCssVars: () => {
    const { themes, currentId, darkPreview } = get();
    const theme = themes.find((t) => t.id === currentId);
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty("--bg", theme.colors.bg);
    root.style.setProperty("--fg", theme.colors.fg);
    root.style.setProperty("--muted", theme.colors.muted);
    root.style.setProperty("--primary", theme.colors.primary);
    root.style.setProperty("--primary-fg", theme.colors.primaryFg);
    root.style.setProperty("--accent", theme.colors.accent);
    root.dataset.previewDark = darkPreview ? "1" : "0";
  },
}));
