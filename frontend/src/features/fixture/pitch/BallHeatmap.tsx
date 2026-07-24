"use client";

import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import type { FixtureBallCoordinate } from "@/types/fixture";

import PitchSurface from "./PitchSurface";
import { buildHeatmapCircles } from "./pitch-utils";

interface BallHeatmapProps {
  points: FixtureBallCoordinate[];
}

export default function BallHeatmap({ points }: BallHeatmapProps) {
  const circles = useMemo(() => buildHeatmapCircles(points), [points]);

  return (
    <Card className="overflow-hidden border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.94))]">
      <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Ball Occupation
        </p>
        <h3 className="mt-2 font-display text-[2rem] leading-none text-white">Ball Heatmap</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
          Weighted by possession duration to surface where the ball spent the most time.
        </p>
      </div>

      <div className="space-y-5 px-4 py-5 sm:px-6">
        {circles.length ? (
          <PitchSurface>
            <defs>
              <filter id="heatmap-blur">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
            </defs>

            <g filter="url(#heatmap-blur)">
              {circles.map((circle, index) => (
                <circle
                  key={`${circle.x}-${circle.y}-${circle.duration}-${index}`}
                  cx={circle.x}
                  cy={circle.y}
                  r={circle.radius}
                  fill={
                    circle.tone === "hot"
                      ? "rgba(249,115,22,0.92)"
                      : circle.tone === "warm"
                        ? "rgba(209,255,0,0.8)"
                        : "rgba(59,130,246,0.72)"
                  }
                  opacity={circle.opacity}
                />
              ))}
            </g>
          </PitchSurface>
        ) : (
          <div className="border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-14 text-center">
            <p className="font-display text-[2rem] leading-none text-white">Ball Heatmap</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              No ball coordinate data is available for this fixture yet.
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 border border-zinc-800 bg-zinc-950/50 px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Heat Intensity
          </span>
          <div className="h-2 flex-1 bg-[linear-gradient(90deg,rgba(59,130,246,0.8),rgba(209,255,0,0.95),rgba(249,115,22,0.95))]" />
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
