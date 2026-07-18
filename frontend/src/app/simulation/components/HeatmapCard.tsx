"use client";

import { Flame } from "lucide-react";

import SimulationCard from "./SimulationCard";

export default function HeatmapCard() {
  return (
    <SimulationCard title="Heatmap Surface" description="Positional influence, lane occupation, and action density will appear once the engine output is connected.">
      <div className="flex min-h-[320px] items-center justify-center border border-dashed border-zinc-800 bg-[linear-gradient(180deg,rgba(15,15,15,0.96),rgba(6,6,6,0.96))]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-zinc-800 bg-black/50 text-zinc-500">
            <Flame className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">Heatmap Container</p>
        </div>
      </div>
    </SimulationCard>
  );
}
