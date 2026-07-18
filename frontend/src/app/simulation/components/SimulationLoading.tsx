"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

interface SimulationLoadingProps {
  progress: number;
  currentStage: string;
  stages: string[];
}

export default function SimulationLoading({
  progress,
  currentStage,
  stages,
}: SimulationLoadingProps) {
  return (
    <div className="space-y-6 border border-zinc-800/80 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_12%,transparent),_transparent_46%),linear-gradient(180deg,rgba(24,24,24,0.98),rgba(8,8,8,0.98))] p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="accent-text text-xs font-semibold uppercase tracking-[0.32em]">
            Simulation Engine
          </p>
          <h2 className="font-display text-[2.3rem] leading-[0.95] text-white sm:text-[2.8rem]">
            Running Match Intelligence
          </h2>
          <p className="text-sm leading-7 text-zinc-400">
            The studio is processing tactical context, lineup structure, and scenario
            weighting before publishing the result workspace.
          </p>
        </div>

        <div className="relative flex h-40 w-full items-center justify-center overflow-hidden border border-zinc-800 bg-black/40 sm:h-44 lg:max-w-[360px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute h-28 w-28 border border-[color:var(--accent)]/35"
          />
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute h-20 w-20 border border-zinc-700"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="accent-bg-soft accent-border-soft flex h-16 w-16 items-center justify-center border"
          >
            <Zap className="accent-text h-8 w-8" />
          </motion.div>

          <motion.div
            animate={{ x: [-120, 120], opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-px w-24 bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4 border border-zinc-800 bg-zinc-950/65 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                Active Stage
              </p>
              <p className="mt-2 text-lg font-medium text-white">{currentStage}</p>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="accent-text h-4 w-4" />
              <span className="text-sm">{progress}%</span>
            </div>
          </div>

          <div className="h-3 overflow-hidden border border-zinc-800 bg-black/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="h-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent)_72%,white_8%),color-mix(in_srgb,var(--accent)_42%,transparent))]"
            />
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950/65 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Engine Queue
          </p>

          <div className="mt-4 space-y-3">
            {stages.map((stage, index) => {
              const active = stage === currentStage;
              const complete = progress >= ((index + 1) / stages.length) * 100;

              return (
                <div key={stage} className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 shrink-0 ${
                      active
                        ? "bg-[color:var(--accent)]"
                        : complete
                          ? "bg-zinc-300"
                          : "bg-zinc-700"
                    }`}
                  />
                  <p className={active ? "text-sm text-white" : "text-sm text-zinc-500"}>
                    {stage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
