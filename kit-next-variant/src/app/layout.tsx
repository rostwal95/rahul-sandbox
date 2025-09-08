import type { Metadata } from "next";
import "./globals.css";
import { ToastHost } from "@/components/ToastHost";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandPalette } from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "Kit Builders Platform",
  description: "Publishing tools demo — Onboarding → Activation → Conversion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
          <CommandPalette />
          <ToastHost />
        </ThemeProvider>
      </body>
    </html>
  );
}
