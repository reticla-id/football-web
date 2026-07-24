"use client";

import type { FixtureBallCoordinate, FixturePressure, TeamFixture } from "@/types/fixture";

import FixturePressureTimeline from "@/features/fixture/pressure/FixturePressureTimeline";

import BallHeatmap from "./BallHeatmap";
import BallPositionZones from "./BallPositionZones";

interface FixtureActionMapsProps {
  fixture: TeamFixture;
  pressures: FixturePressure[];
  ballCoordinates: FixtureBallCoordinate[];
}

export default function FixtureActionMaps({
  fixture,
  pressures,
  ballCoordinates,
}: FixtureActionMapsProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <FixturePressureTimeline fixture={fixture} pressures={pressures} />

      <div className="grid gap-4 xl:grid-cols-2">
        <BallHeatmap points={ballCoordinates} />
        <BallPositionZones points={ballCoordinates} />
      </div>
    </div>
  );
}
