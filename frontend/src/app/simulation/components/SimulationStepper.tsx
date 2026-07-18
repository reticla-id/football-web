"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type SimulationStepId =
  | "match-setup"
  | "formation-squad"
  | "tactics"
  | "simulation-mode"
  | "prediction-summary";

export interface SimulationStep {
  id: SimulationStepId;
  label: string;
  eyebrow: string;
}

interface SimulationStepperProps {
  steps: SimulationStep[];
  activeStep: SimulationStepId;
  onStepChange: (step: SimulationStepId) => void;
}

export default function SimulationStepper({
  steps,
  activeStep,
  onStepChange,
}: SimulationStepperProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <div className="overflow-hidden border border-zinc-800/80 bg-zinc-900/70">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => {
          const active = step.id === activeStep;
          const complete = index < activeIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className="relative border-b border-zinc-800/70 px-4 py-4 text-left transition-colors duration-200 hover:bg-zinc-800/60 sm:border-r xl:border-b-0 last:border-r-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center border text-sm font-semibold transition-colors",
                    active
                      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
                      : complete
                        ? "border-zinc-600 bg-zinc-900 text-white"
                        : "border-zinc-800 bg-zinc-950/70 text-zinc-500"
                  )}
                >
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    {step.eyebrow}
                  </p>
                  <p className={cn("mt-1 text-sm font-medium", active ? "text-white" : "text-zinc-400")}>
                    {step.label}
                  </p>
                </div>
              </div>

              {active ? (
                <motion.div
                  layoutId="simulation-step-indicator"
                  className="absolute bottom-0 left-4 right-4 h-[3px] bg-[color:var(--accent)]"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
