"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  Mail,
  Layers,
  Home,
  PlusCircle,
  Sun,
  Moon,
  Settings2,
  FileText,
  Play,
  Pause,
  ListPlus,
  RefreshCcw,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/stores/useTheme";

interface Action {
  id: string;
  label: string;
  keywords?: string;
  group?: string;
  icon?: any;
  run: () => void;
}

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/\s+/g, " ").trim();
}

function score(query: string, target: string) {
  if (!query) return 0;
  const qi = normalize(query).split(" ");
  const ti = normalize(target);
  let total = 0;
  for (const q of qi) {
    const idx = ti.indexOf(q);
    if (idx === -1) return -1;
    // proximity bonus
    total += 10 - Math.min(9, idx) + (q.length / ti.length) * 4;
  }
  return total;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const toggleDark = useTheme((s) => s.toggleDark);
  const dark = useTheme((s) => s.darkPreview);

  const sim = useAppStore((s) => s.sim);
  const setSim = useAppStore((s) => s.setSim);
  const addLog = useAppStore((s) => s.addLog);

  const actions: Action[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Go to Dashboard",
        keywords: "home main overview",
        icon: Home,
        run: () => router.push("/dashboard"),
      },
      {
        id: "pages",
        label: "Open Page Builder",
        keywords: "landing builder page",
        icon: Layers,
        run: () => router.push("/builder/page/demo"),
      },
      {
        id: "emails",
        label: "Open Email Designer",
        keywords: "email broadcast compose",
        icon: Mail,
        run: () => router.push("/builder/email/demo"),
      },
      {
        id: "broadcast",
        label: "New Broadcast",
        keywords: "send email new broadcast",
        icon: Mail,
        run: () => router.push("/broadcast"),
      },
      {
        id: "sequence",
        label: "Newsletter Sequence",
        keywords: "automation drip sequence",
        icon: FileText,
        run: () => router.push("/sequence"),
      },
      {
        id: "toggle-theme",
        label: dark ? "Switch to Light Mode" : "Switch to Dark Mode",
        keywords: "theme color dark light appearance",
        icon: dark ? Sun : Moon,
        run: () => toggleDark(),
      },
      {
        id: "new-page",
        label: "Create New Landing Page (placeholder)",
        keywords: "add create landing page",
        icon: PlusCircle,
        run: () => alert("Placeholder create page"),
      },
      {
        id: "prefs",
        label: "Open Preferences (placeholder)",
        keywords: "settings preferences config",
        icon: Settings2,
        run: () => alert("Preferences TBD"),
      },
      {
        id: "sim-toggle",
        label: sim.running ? "Stop Simulation" : "Start Simulation (24 ticks)",
        keywords: "simulation traffic play stop",
        icon: sim.running ? Pause : Play,
        run: () => {
          if (sim.running) {
            addLog("⏸ Simulation stopped (palette)");
            setSim({ running: false, remaining: 0 });
          } else {
            addLog("▶️ Simulation started (palette)");
            setSim({ running: true, remaining: 24, speed: 250 });
          }
        },
      },
      {
        id: "sequence-add-email",
        label: "Add Email To Sequence",
        keywords: "sequence email add drip newsletter",
        icon: ListPlus,
        run: () => router.push("/sequence#add-email"),
      },
      {
        id: "refresh-dashboard",
        label: "Refresh Dashboard",
        keywords: "refresh reload rerender",
        icon: RefreshCcw,
        run: () => router.refresh(),
      },
    ],
    [router, toggleDark, dark, sim.running, sim.remaining, setSim, addLog]
  );

  const filtered = useMemo(() => {
    const nq = q.trim();
    if (!nq) return actions.slice(0, 8);
    return actions
      .map((a) => ({ a, s: score(nq, a.label + " " + (a.keywords || "")) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.a);
  }, [q, actions]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((o) => !o);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[var(--z-dialog)] flex items-start justify-center px-4 pt-[15vh]"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-[rgba(var(--border),0.85)] bg-[rgb(var(--card))] shadow-soft overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(var(--border),0.7)]">
          <Command className="h-4 w-4 opacity-60 shrink-0" />
          <input
            autoFocus
            placeholder="Type a command or search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent outline-none text-sm placeholder:text-[rgba(var(--muted),0.7)]"
            aria-label="Command search"
          />
          <kbd className="ml-2">Esc</kbd>
        </div>
        <ul className="max-h-[420px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-muted">
              No matches
            </li>
          )}
          {filtered.map((a) => {
            const Icon = a.icon || Command;
            return (
              <li key={a.id}>
                <button
                  onClick={() => {
                    a.run();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[rgba(var(--accent),0.08)] focus:bg-[rgba(var(--accent),0.12)] focus:outline-none"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[rgb(var(--accent))]" />
                  <span className="flex-1 min-w-0 truncate" title={a.label}>
                    {a.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
