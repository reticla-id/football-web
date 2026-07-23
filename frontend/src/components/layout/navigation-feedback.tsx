"use client";

import { AnimatePresence, motion } from "framer-motion";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface NavigationFeedbackProps {
  visible: boolean;
}

export function NavigationFeedback({ visible }: NavigationFeedbackProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <>
          <motion.div
            initial={{ opacity: 0, scaleX: 0.15 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.85 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-px origin-left bg-[color:var(--accent-secondary)]"
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none fixed inset-x-4 top-4 z-[91] flex justify-center sm:justify-end"
          >
            <div className="flex items-center gap-3 border border-zinc-800/90 bg-black/90 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <LoadingSpinner className="h-4 w-4 text-[var(--accent-secondary)]" />

              <div className="leading-tight">
                <p className="text-sm font-medium text-white">Loading page...</p>
                <p className="text-xs text-zinc-400">Preparing content...</p>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
