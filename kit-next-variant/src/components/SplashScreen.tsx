"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-dvh">
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 grid place-items-center bg-white z-50"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm font-medium">Loading Kit Builders…</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {children}
    </div>
  );
}
