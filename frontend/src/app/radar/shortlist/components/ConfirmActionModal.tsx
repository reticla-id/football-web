"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  eyebrow: string;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmActionModal({
  open,
  eyebrow,
  title,
  description,
  confirmLabel,
  isSubmitting,
  onClose,
  onConfirm,
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-lg border border-zinc-800 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-zinc-800 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-400">
                {eyebrow}
              </p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center border border-rose-500/70 bg-rose-600 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-white transition-all duration-200 hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
