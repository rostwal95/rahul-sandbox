import { create } from "zustand";
import { EventType, createEvent } from "../models";

export interface FunnelKpis {
  started: boolean;
  completedProfile: boolean;
  createdPage: boolean;
  createdEmail: boolean;
  publishedOrExported: boolean;
  activated: boolean;
}

interface FunnelState {
  events: EventType[];
  kpis: FunnelKpis;
  logEvent: (e: EventType) => void;
  compute: () => void;
  reset: () => void;
}

const emptyKpis: FunnelKpis = {
  started: false,
  completedProfile: false,
  createdPage: false,
  createdEmail: false,
  publishedOrExported: false,
  activated: false,
};

export const useFunnel = create<FunnelState>((set, get) => ({
  events: [],
  kpis: emptyKpis,
  logEvent: (e) => {
    set((s) => ({ events: [e, ...s.events].slice(0, 500) }));
    get().compute();
  },
  compute: () => {
    const events = get().events;
    const k: FunnelKpis = { ...emptyKpis };
    for (const e of events) {
      switch (e.type) {
        case "onboarding:start":
          k.started = true;
          break;
        case "onboarding:completeProfile":
          k.completedProfile = true;
          break;
        case "create:page":
          k.createdPage = true;
          break;
        case "create:email":
          k.createdEmail = true;
          break;
        case "publish:page":
          k.publishedOrExported = true;
          break;
        case "export:email":
          k.publishedOrExported = true;
          break;
        case "activate":
          k.activated = true;
          break;
      }
    }
    if (k.publishedOrExported && !k.activated) {
      // Derive activation when first publish/export happens if missing explicit event
      const explicit = events.find((e) => e.type === "activate");
      if (!explicit) {
        const derived = createEvent("activate");
        set((s) => ({ events: [derived, ...s.events] }));
        k.activated = true;
      }
    }
    set({ kpis: k });
  },
  reset: () => set({ events: [], kpis: emptyKpis }),
}));
