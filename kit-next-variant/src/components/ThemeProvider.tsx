"use client";
import { useEffect } from "react";
import { useTheme } from "@/lib/stores/useTheme";
import { getThemes, putTheme } from "@/lib/db";
import { ThemeTokenType } from "@/lib/models";

const defaultTheme: ThemeTokenType = {
  id: "default-theme",
  name: "Default",
  colors: {
    bg: "#ffffff",
    fg: "#0a0a0a",
    muted: "#6b7280",
    primary: "#0ea5e9",
    primaryFg: "#020617",
    accent: "#6366f1",
  },
  radius: "xl",
  spacing: "cozy",
  font: "inter",
};

function hexToRgbTriplet(hex: string) {
  if (!hex.startsWith("#")) return hex;
  let h = hex.slice(1);
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const num = parseInt(h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r} ${g} ${b}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const {
    themes,
    currentId,
    addTheme,
    setCurrent,
    injectCssVars,
    darkPreview,
  } = useTheme();

  // load themes once
  useEffect(() => {
    (async () => {
      try {
        const stored = await getThemes();
        if (!stored.length) {
          addTheme(defaultTheme);
          setCurrent(defaultTheme.id);
          await putTheme(defaultTheme);
        } else {
          stored.forEach(addTheme);
          if (!currentId) setCurrent(stored[0].id);
        }
      } catch {
        // fallback localStorage quick demo
        const raw = localStorage.getItem("kit_themes");
        if (raw) {
          try {
            JSON.parse(raw).forEach((t: ThemeTokenType) => addTheme(t));
          } catch {}
        } else {
          addTheme(defaultTheme);
          setCurrent(defaultTheme.id);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // inject css vars on changes
  useEffect(() => {
    const theme = themes.find((t) => t.id === currentId);
    const root = document.documentElement;
    if (!theme) return;
    // core tokens
    root.style.setProperty("--bg", hexToRgbTriplet(theme.colors.bg));
    root.style.setProperty("--fg", hexToRgbTriplet(theme.colors.fg));
    root.style.setProperty("--muted", hexToRgbTriplet(theme.colors.muted));
    root.style.setProperty("--primary", hexToRgbTriplet(theme.colors.primary));
    root.style.setProperty(
      "--primary-fg",
      hexToRgbTriplet(theme.colors.primaryFg)
    );
    root.style.setProperty("--accent", hexToRgbTriplet(theme.colors.accent));
    // derived / fallback tokens if missing
    if (!root.style.getPropertyValue("--accent-fg")) {
      root.style.setProperty("--accent-fg", "255 255 255");
    }
    if (!root.style.getPropertyValue("--card")) {
      root.style.setProperty("--card", hexToRgbTriplet(theme.colors.bg));
    }
    if (!root.style.getPropertyValue("--surface")) {
      root.style.setProperty("--surface", hexToRgbTriplet(theme.colors.bg));
    }
    if (!root.style.getPropertyValue("--border")) {
      root.style.setProperty("--border", "226 232 240");
    }
    // dark class toggle
    if (darkPreview) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [themes, currentId, darkPreview]);

  return <>{children}</>;
}
