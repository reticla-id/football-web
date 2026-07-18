"use client";

import { Clock3 } from "lucide-react";

import SimulationCard from "./SimulationCard";

export default function TimelineCard() {
  return (
    <SimulationCard title="Simulation Timeline" description="Future event sequencing, live commentary moments, and match momentum will render here.">
      <div className="space-y-4">
        {["Opening Phase", "Key Match Event", "Momentum Shift", "Late Match Scenario"].map((label, index) => (
          <div key={label} className="grid grid-cols-[32px_1fr] gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-zinc-950/70 text-zinc-500">
                <Clock3 className="h-4 w-4" />
              </div>
              {index < 3 ? <div className="mt-2 h-full w-px bg-zinc-800" /> : null}
            </div>
            <div className="border border-dashed border-zinc-800 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </SimulationCard>
  );
}
