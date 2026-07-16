"use client";

import { motion } from "framer-motion";

export default function ShortlistHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-3"
    >
      <p className="accent-text text-xs font-semibold uppercase tracking-[0.34em]">
        Radar Shortlist
      </p>
      <h1 className="font-display text-[3rem] leading-[0.92] text-white sm:text-[3.8rem]">
        Shortlist
      </h1>
      <p className="max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
        Manage your scouting collections and saved players.
      </p>
    </motion.div>
  );
}
