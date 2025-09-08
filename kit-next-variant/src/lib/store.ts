import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

// Schemas
export const FunnelSchema = z.object({
  views: z.number(),
  signups: z.number(),
  emailsSent: z.number(),
});
export type Funnel = z.infer<typeof FunnelSchema>;

export const GoalsSchema = z.object({
  published: z.boolean(),
  signups: z.number(),
  emailSent: z.boolean(),
});
export type Goals = z.infer<typeof GoalsSchema>;

export const SimSchema = z.object({
  running: z.boolean(),
  remaining: z.number(),
  speed: z.number(),
});
export type Sim = z.infer<typeof SimSchema>;

interface AppState {
  funnel: Funnel;
  goals: Goals;
  sim: Sim;
  setFunnel: (p: Partial<Funnel>) => void;
  setGoals: (p: Partial<Goals>) => void;
  setSim: (p: Partial<Sim>) => void;
  reset: () => void;
}
export type LogEntry = { id: string; ts: string; msg: string };
export interface Trends {
  views: number[];
  signups: number[];
  emails: number[];
}

interface AppState {
  funnel: Funnel;
  goals: Goals;
  sim: Sim;
  publishedSnapshot?: {
    headline: string;
    sub: string;
    bullets: string[];
    cta: string;
    theme?: string;
    ts: string; // ISO timestamp when published
    variant?: string; // A/B variant id
    id?: string; // history id
  } | null;
  snapshotHistory?: {
    id: string;
    ts: string;
    variant?: string;
    data: {
      headline: string;
      sub: string;
      bullets: string[];
      cta: string;
      theme?: string;
    };
  }[];
  hasPublished: boolean;
  log: LogEntry[];
  trends: Trends;
  // setters
  setFunnel: (p: Partial<Funnel>) => void;
  setGoals: (p: Partial<Goals>) => void;
  setSim: (p: Partial<Sim>) => void;
  setHasPublished: (v: boolean) => void;
  pushTrend: (key: keyof Trends, value: number) => void;
  addLog: (msg: string) => void;
  incViews: (n?: number, source?: string) => void;
  incSignups: (n?: number, source?: string) => void;
  incEmailsSent: (n?: number, source?: string) => void;
  markPublished: (seed?: number) => void;
  publishSnapshot: (
    data: {
      headline: string;
      sub: string;
      bullets: string[];
      cta: string;
      theme?: string;
      variant?: string;
    },
    seed?: number
  ) => void;
  republishSnapshot: (data: {
    headline: string;
    sub: string;
    bullets: string[];
    cta: string;
    theme?: string;
    variant?: string;
  }) => void;
  rollbackSnapshot: (id: string) => void;
  reset: () => void;
}

const defaultState: Pick<
  AppState,
  | "funnel"
  | "goals"
  | "sim"
  | "hasPublished"
  | "log"
  | "trends"
  | "publishedSnapshot"
  | "snapshotHistory"
> = {
  funnel: { views: 0, signups: 0, emailsSent: 0 },
  goals: { published: false, signups: 0, emailSent: false },
  sim: { running: false, remaining: 0, speed: 250 },
  hasPublished: false,
  log: [],
  trends: { views: [0], signups: [0], emails: [0] },
  publishedSnapshot: null,
  snapshotHistory: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setFunnel: (p: Partial<Funnel>) =>
        set((s: AppState) => ({ funnel: { ...s.funnel, ...p } })),
      setGoals: (p: Partial<Goals>) =>
        set((s: AppState) => ({ goals: { ...s.goals, ...p } })),
      setSim: (p: Partial<Sim>) =>
        set((s: AppState) => ({ sim: { ...s.sim, ...p } })),
      reset: () => set(() => ({ ...defaultState })),
      setHasPublished: (v: boolean) =>
        set(() => ({
          hasPublished: v,
          goals: { ...get().goals, published: v },
        })),
      pushTrend: (key, value) =>
        set((s) => ({
          trends: { ...s.trends, [key]: [...s.trends[key], value].slice(-96) },
        })),
      addLog: (msg: string) =>
        set((s) => {
          const newId =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now().toString(36)}-${Math.random()
                  .toString(36)
                  .slice(2, 10)}`;

          const ts = new Date().toISOString().slice(11, 19);
          const MAX_LOG = 500;
          return {
            log: [
              {
                id: newId,
                ts,
                msg,
              },
              ...s.log,
            ]
              // Defensive de-dupe in case identical IDs somehow slip in
              .filter(
                (entry, idx, arr) =>
                  arr.findIndex((e) => e.id === entry.id) === idx
              )
              .slice(0, MAX_LOG),
          };
        }),
      incViews: (n = 1, source = "views") => {
        const { funnel, pushTrend, addLog } = get();
        const views = funnel.views + n;
        pushTrend("views", views);
        set({ funnel: { ...funnel, views } });
        addLog(
          `${
            source === "publish"
              ? "Published landing page"
              : source === "sim"
              ? "Simulated traffic"
              : "Previewed page"
          } (+${n} views)`
        );
      },
      incSignups: (n = 1, source = "user") => {
        if (n <= 0) return;
        const { funnel, pushTrend, addLog, goals } = get();
        const signups = funnel.signups + n;
        pushTrend("signups", signups);
        set({
          funnel: { ...funnel, signups },
          goals: { ...goals, signups: goals.signups + n },
        });
        addLog(
          `${source === "sim" ? "Simulated signup" : "Signup captured"} (+${n})`
        );
      },
      incEmailsSent: (n = 1, source = "user") => {
        const { funnel, pushTrend, addLog, goals } = get();
        const emailsSent = funnel.emailsSent + n;
        pushTrend("emails", emailsSent);
        set({
          funnel: { ...funnel, emailsSent },
          goals: { ...goals, emailSent: true },
        });
        addLog(
          `${
            source === "sim" ? "Simulated broadcast" : "Broadcast sent"
          } (+${n})`
        );
      },
      markPublished: (seed = 25) => {
        const { setHasPublished, incViews, addLog } = get();
        setHasPublished(true);
        addLog("Landing page published");
        incViews(seed, "publish");
      },
      publishSnapshot: (data, seed = 25) => {
        const { addLog, incViews, snapshotHistory = [] } = get();
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;
        set(() => ({
          publishedSnapshot: {
            ...data,
            ts: new Date().toISOString(),
            id,
          },
          hasPublished: true,
          goals: { ...get().goals, published: true },
          snapshotHistory: [
            ...snapshotHistory,
            {
              id,
              ts: new Date().toISOString(),
              variant: (data as any).variant,
              data,
            },
          ].slice(-50),
        }));
        addLog("Snapshot published");
        incViews(seed, "publish");
      },
      republishSnapshot: (data) => {
        const { addLog, snapshotHistory = [] } = get();
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;
        set(() => ({
          publishedSnapshot: {
            ...data,
            ts: new Date().toISOString(),
            id,
          },
          snapshotHistory: [
            ...snapshotHistory,
            { id, ts: new Date().toISOString(), variant: data.variant, data },
          ].slice(-50),
        }));
        addLog("Snapshot re-published");
      },
      rollbackSnapshot: (id: string) => {
        const { snapshotHistory = [], addLog } = get() as any;
        const match = snapshotHistory.find((v: any) => v.id === id);
        if (!match) return;
        set(() => ({
          publishedSnapshot: {
            ...match.data,
            ts: new Date().toISOString(),
            id: match.id,
            variant: match.variant,
          },
        }));
        addLog("Snapshot rolled back");
      },
    }),
    { name: "kit_app_store", version: 1 }
  )
);
