"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  name: string;
  description: string;
  isSubmitting: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CreateCollectionModal({
  open,
  name,
  description,
  isSubmitting,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSubmit,
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
            className="w-full max-w-xl border border-zinc-800 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-zinc-800 px-5 py-4">
              <p className="accent-text text-[11px] font-semibold uppercase tracking-[0.28em]">
                New Collection
              </p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-white">
                Create Collection
              </h2>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="space-y-2">
                <label
                  htmlFor="collection-name"
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500"
                >
                  Collection Name
                </label>
                <input
                  id="collection-name"
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="Transfer Targets"
                  className="focus-accent h-11 w-full border border-zinc-800 bg-zinc-950/80 px-4 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 hover:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="collection-description"
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500"
                >
                  Description
                </label>
                <textarea
                  id="collection-description"
                  value={description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder="High priority profiles for the next recruitment cycle."
                  rows={4}
                  className="focus-accent w-full border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 hover:border-zinc-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-5 py-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="button" onClick={onSubmit} disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? "Creating..." : "Create Collection"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
