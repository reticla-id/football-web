"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ShortlistCollection } from "@/lib/supabase/types";

interface Props {
  open: boolean;
  collections: ShortlistCollection[];
  selectedPlayerName?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSelectCollection: (collection: ShortlistCollection) => void;
}

export default function CollectionPickerDialog({
  open,
  collections,
  selectedPlayerName,
  isSubmitting = false,
  onClose,
  onSelectCollection,
}: Props) {
  const hasCollections = collections.length > 0;

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
                Shortlist
              </p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-white">
                {hasCollections ? "Add to Shortlist" : "No Collections Yet"}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                {hasCollections
                  ? `Choose a collection to save ${selectedPlayerName ?? "this player"}.`
                  : "You don't have any collections yet."}
              </p>
            </div>

            {hasCollections ? (
              <div className="max-h-[420px] overflow-y-auto px-5 py-4">
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => onSelectCollection(collection)}
                      className="group w-full border border-zinc-800 bg-zinc-950/70 px-4 py-4 text-left transition-all duration-200 hover:border-[color:var(--accent)]/40 hover:bg-zinc-900 disabled:pointer-events-none disabled:opacity-60"
                    >
                      <p className="font-semibold text-white">{collection.name}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {collection.description?.trim() || "No description"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-5 py-6">
                <div className="flex items-center gap-4 border border-dashed border-zinc-800 bg-zinc-950/70 px-4 py-5">
                  <div className="accent-bg-soft accent-border-soft accent-text flex h-12 w-12 shrink-0 items-center justify-center border">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Start with your first shortlist</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Create a collection first, then you can save players from the explorer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-5 py-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>

              {!hasCollections ? (
                <Button asChild type="button">
                  <Link href="/radar/shortlist">Create Collection</Link>
                </Button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
