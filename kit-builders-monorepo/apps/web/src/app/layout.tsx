import "./globals.css";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/ToastProvider";
import React from "react";
import { Inter } from "next/font/google";
import { ShortcutHandler } from "../components/ShortcutHandler";
import { ShortcutsDialog } from "../components/ShortcutsDialog";
import { GlobalToastListener } from "../components/GlobalToastListener";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Root layout: add suppressHydrationWarning to avoid noisy diffs from dev tooling / extensions
// that may inject attributes (e.g. VSCode webview adds --vsc-domain style vars client-side).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head />
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-[var(--bg)] text-[var(--ink)]"
      >
        <ThemeScript />
        <Providers>
          <ToastProvider>
            <ShortcutHandler />
            <ShortcutsDialog />
            <GlobalToastListener />
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}

// Inject initial theme based on prefers-color-scheme without flash
function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(()=>{try{const ls=localStorage.getItem('theme');const m=window.matchMedia('(prefers-color-scheme: dark)').matches;const t=ls|| (m?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
      }}
    />
  );
}

// ShortcutHandler moved to dedicated client component
