"use client";

import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import type { FixtureBallCoordinate } from "@/types/fixture";

import PitchSurface from "./PitchSurface";
import { buildPitchZoneStats } from "./pitch-utils";

interface BallPositionZonesProps {
  points: FixtureBallCoordinate[];
}

export default function BallPositionZones({ points }: BallPositionZonesProps) {
  const zones = useMemo(() => buildPitchZoneStats(points), [points]);
  const hasData = zones.some((zone) => zone.seconds > 0);

  return (
    <Card className="overflow-hidden border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.94))]">
      <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Tactical Occupation
        </p>
        <h3 className="mt-2 font-display text-[2rem] leading-none text-white">Ball Position Zones</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
          Nine-sector split showing where possession time accumulated across the pitch.
        </p>
      </div>

      <div className="px-4 py-5 sm:px-6">
        {hasData ? (
          <PitchSurface>
            {zones.map((zone) => (
              <g key={zone.id}>
                <rect
                  x={zone.rect.x}
                  y={zone.rect.y}
                  width={zone.rect.width}
                  height={zone.rect.height}
                  fill={`rgba(209,255,0,${0.04 + zone.intensity * 0.28})`}
                />
                <rect
                  x={zone.rect.x}
                  y={zone.rect.y}
                  width={zone.rect.width}
                  height={zone.rect.height}
                  fill="none"
                  stroke="rgba(244,244,245,0.14)"
                  strokeWidth="0.45"
                />

                <text
                  x={zone.center.x}
                  y={zone.center.y - 1.5}
                  textAnchor="middle"
                  fontSize="4.1"
                  fontWeight="700"
                  fill="rgba(255,255,255,0.96)"
                  paintOrder="stroke"
                  stroke="rgba(9,9,11,0.92)"
                  strokeWidth="0.65"
                >
                  {zone.percentage.toFixed(1)}%
                </text>
              </g>
            ))}
          </PitchSurface>
        ) : (
          <div className="border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-14 text-center">
            <p className="font-display text-[2rem] leading-none text-white">Ball Position Zones</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              No zone occupation data is available for this fixture yet.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
