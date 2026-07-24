"use client";

import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Customized,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  PRESSURE_TONE_CLASSNAME,
  resolvePressureEventConfig,
} from "@/features/fixture/pressure/pressure-config";
import {
  buildPressureTimelineData,
  type PressureEventMarker,
  type PressureTimelinePoint,
} from "@/features/fixture/pressure/pressure-utils";
import type { FixturePressure, TeamFixture } from "@/types/fixture";

interface FixturePressureTimelineProps {
  fixture: TeamFixture;
  pressures: FixturePressure[];
}

export default function FixturePressureTimeline({
  fixture,
  pressures,
}: FixturePressureTimelineProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<HoveredPressureEvent | null>(null);
  const chartData = useMemo(
    () => buildPressureTimelineData(pressures, fixture.home?.id, fixture.away?.id),
    [fixture.away?.id, fixture.home?.id, pressures]
  );
  const maxPressure = useMemo(() => {
    const values = pressures
      .map((entry) => Math.abs(typeof entry.pressure === "number" ? entry.pressure : 0))
      .filter((value) => Number.isFinite(value));

    return values.length ? Math.max(...values) : 1;
  }, [pressures]);
  const minuteLookup = useMemo(
    () => new Map(chartData.map((point) => [point.minute, point])),
    [chartData]
  );
  const hoveredPoint = hoveredEvent ? minuteLookup.get(hoveredEvent.minute) ?? null : null;
  const hoveredIsHome = hoveredEvent
    ? hoveredEvent.participantId === fixture.home.id
    : null;

  if (!pressures.length) {
    return (
      <div className="border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-14 text-center">
        <p className="font-display text-[2rem] leading-none text-white">Pressure Timeline</p>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          No pressure timeline data is available for this fixture yet.
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(9,9,11,0.94))]">
      <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Match Momentum
            </p>
            <h2 className="mt-2 font-display text-[2rem] leading-none text-white">
              Pressure Timeline
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <LegendPill colorClassName="bg-sky-500" label={fixture.home.name} />
            <LegendPill colorClassName="bg-rose-500" label={fixture.away.name} />
          </div>
        </div>
      </div>

      <div ref={chartContainerRef} className="relative h-[360px] w-full px-3 py-4 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 28, right: 12, left: 12, bottom: 16 }}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <defs>
              <linearGradient id="fixture-pressure-home" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fixture-pressure-away" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.02} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.38} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(63,63,70,0.35)" strokeDasharray="3 3" vertical={false} />
            <ReferenceLine y={0} stroke="rgba(161,161,170,0.35)" />
            <XAxis
              dataKey="minute"
              type="number"
              domain={[0, "dataMax"]}
              tickCount={10}
              tickLine={false}
              axisLine={false}
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickFormatter={(value) => `${value}'`}
            />
            <YAxis
              domain={[-maxPressure, maxPressure]}
              tickCount={5}
              tickLine={false}
              axisLine={false}
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickFormatter={(value) => `${Math.abs(Number(value))}`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.16)", strokeDasharray: "4 4" }}
              content={
                <PressureTooltip
                  homeName={fixture.home.name}
                  awayName={fixture.away.name}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="homePressure"
              stroke="#38bdf8"
              fill="url(#fixture-pressure-home)"
              strokeWidth={2.5}
              strokeOpacity={hoveredEvent ? (hoveredIsHome ? 1 : 0.28) : 1}
              fillOpacity={hoveredEvent ? (hoveredIsHome ? 1 : 0.2) : 1}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="awayPressure"
              stroke="#f43f5e"
              fill="url(#fixture-pressure-away)"
              strokeWidth={2.5}
              strokeOpacity={hoveredEvent ? (hoveredIsHome ? 0.28 : 1) : 1}
              fillOpacity={hoveredEvent ? (hoveredIsHome ? 0.2 : 1) : 1}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />

            <Customized
              component={(props) => (
                <PressureEventMarkers
                  xAxisMap={(props as PressureMarkerLayerProps | null)?.xAxisMap}
                  yAxisMap={(props as PressureMarkerLayerProps | null)?.yAxisMap}
                  offset={(props as PressureMarkerLayerProps | null)?.offset}
                  containerRef={chartContainerRef}
                  fixture={fixture}
                  data={chartData}
                  maxPressure={maxPressure}
                  hoveredEvent={hoveredEvent}
                  hoveredEventId={hoveredEvent?.id ?? null}
                  hoveredPoint={hoveredPoint}
                  onEventEnter={setHoveredEvent}
                  onEventLeave={() => setHoveredEvent(null)}
                />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>

        {hoveredEvent && hoveredPoint ? (
          <EventHoverTooltip
            event={hoveredEvent}
            point={hoveredPoint}
            homeName={fixture.home.name}
            awayName={fixture.away.name}
          />
        ) : null}
      </div>
    </Card>
  );
}

function LegendPill({
  colorClassName,
  label,
}: {
  colorClassName: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 ${colorClassName}`} />
      <span className="text-zinc-400">{label}</span>
    </span>
  );
}

function PressureTooltip({
  active,
  payload,
  label,
  homeName,
  awayName,
}: {
  active?: boolean;
  payload?: Array<{ payload: PressureTimelinePoint }>;
  label?: number | string;
  homeName: string;
  awayName: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="w-[240px] border border-zinc-800 bg-black/95 px-4 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.4)] backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        Minute {label}'
      </p>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sky-300">{homeName}</span>
          <span className="font-semibold text-white">{String(point.homePressureDisplay)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-rose-300">{awayName}</span>
          <span className="font-semibold text-white">{String(point.awayPressureDisplay)}</span>
        </div>
      </div>

      {point.events.length ? (
        <div className="mt-4 border-t border-zinc-800 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Events
          </p>
          <div className="mt-2 space-y-2">
            {point.events.map((event) => {
              const config = resolvePressureEventConfig(event.code, event.name);
              const Icon = config.icon;

              return (
                <div key={event.id} className="flex items-start gap-2 text-xs text-zinc-300">
                  <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${PRESSURE_TONE_CLASSNAME[config.tone]}`} />
                  <div>
                    <p className="font-medium text-white">{event.name}</p>
                    <p className="text-zinc-500">{event.teamName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PressureEventMarkers({
  xAxisMap,
  yAxisMap,
  offset,
  containerRef,
  fixture,
  data,
  maxPressure,
  hoveredEvent,
  hoveredEventId,
  hoveredPoint,
  onEventEnter,
  onEventLeave,
}: PressureMarkerLayerProps & {
  xAxisMap?: Record<string, { scale?: (value: number) => number }>;
  yAxisMap?: Record<string, { scale?: (value: number) => number }>;
  offset?: { left?: number; top?: number; width?: number; height?: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  fixture: TeamFixture;
  data: PressureTimelinePoint[];
  maxPressure: number;
  hoveredEvent: HoveredPressureEvent | null;
  hoveredEventId: string | null;
  hoveredPoint: PressureTimelinePoint | null;
  onEventEnter: (event: HoveredPressureEvent) => void;
  onEventLeave: () => void;
}) {
  const xAxis = Object.values(xAxisMap ?? {})[0];
  const yAxis = Object.values(yAxisMap ?? {})[0];

  if (!xAxis?.scale || !yAxis?.scale) {
    return null;
  }

  const xScale = xAxis.scale;
  const yScale = yAxis.scale;

  const allEvents = data.flatMap((point) => point.events);
  const chartLeft = offset?.left ?? 0;
  const chartTop = offset?.top ?? 0;
  const chartWidth = offset?.width ?? 0;
  const chartHeight = offset?.height ?? 0;
  const topGuideY = chartTop + 18;
  const bottomGuideY = chartTop + chartHeight - 18;
  const guideX2 = chartLeft + chartWidth;
  const highlightedY =
    hoveredEvent && hoveredPoint
      ? yScale(
          hoveredEvent.participantId === fixture.home.id
            ? hoveredPoint.homePressure
            : hoveredPoint.awayPressure
        ) + chartTop
      : null;
  const highlightedX =
    hoveredEvent && hoveredPoint
      ? xScale(hoveredPoint.minute) + chartLeft
      : null;

  return (
    <g>
      <line
        x1={chartLeft}
        x2={guideX2}
        y1={topGuideY}
        y2={topGuideY}
        stroke="rgba(56,189,248,0.22)"
        strokeWidth="1"
      />
      <line
        x1={chartLeft}
        x2={guideX2}
        y1={bottomGuideY}
        y2={bottomGuideY}
        stroke="rgba(244,63,94,0.22)"
        strokeWidth="1"
      />

      {highlightedX != null && highlightedY != null && hoveredEvent ? (
        <>
          <line
            x1={highlightedX}
            x2={highlightedX}
            y1={hoveredEvent.participantId === fixture.home.id ? topGuideY : bottomGuideY}
            y2={highlightedY}
            stroke="rgba(255,255,255,0.22)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <circle
            cx={highlightedX}
            cy={highlightedY}
            r="4.5"
            fill={hoveredEvent.participantId === fixture.home.id ? "#38bdf8" : "#f43f5e"}
            stroke="#09090b"
            strokeWidth="2"
          />
        </>
      ) : null}

      {allEvents.map((event) => {
        const config = resolvePressureEventConfig(event.code, event.name);
        const Icon = config.icon;
        const x = xScale(event.minute) + chartLeft;
        const stackOffset = event.stackIndex * 14;
        const isHome = event.participantId === fixture.home.id;
        const y = isHome ? topGuideY + stackOffset : bottomGuideY - stackOffset;
        const active = hoveredEventId === event.id;
        const pressurePointY =
          yScale(isHome ? event.mirroredPressure : event.mirroredPressure) + chartTop;
        const connectorStartY = isHome ? y + 10 : y - 10;

        return (
          <g
            key={event.id}
            transform={`translate(${x}, ${y})`}
            onMouseEnter={(mouseEvent) => {
              const bounds = containerRef.current?.getBoundingClientRect();
              onEventEnter({
                ...event,
                x: bounds ? mouseEvent.clientX - bounds.left : x,
                y: bounds ? mouseEvent.clientY - bounds.top : y,
              });
            }}
            onMouseLeave={onEventLeave}
            className="cursor-pointer"
          >
            <line
              x1={0}
              x2={0}
              y1={0}
              y2={pressurePointY - y}
              stroke={
                active
                  ? isHome
                    ? "rgba(56,189,248,0.55)"
                    : "rgba(244,63,94,0.55)"
                  : "rgba(255,255,255,0.14)"
              }
              strokeDasharray={active ? "0" : "3 3"}
              strokeWidth={active ? "1.2" : "1"}
            />
            <circle
              r={active ? "10" : "9"}
              fill="rgba(255,255,255,0.98)"
              stroke={
                active
                  ? isHome
                    ? "rgba(56,189,248,0.95)"
                    : "rgba(244,63,94,0.95)"
                  : "rgba(228,228,231,0.9)"
              }
              strokeWidth={active ? "1.5" : "1"}
              style={{
                filter: active
                  ? "drop-shadow(0 6px 12px rgba(0,0,0,0.35))"
                  : "drop-shadow(0 4px 10px rgba(0,0,0,0.28))",
              }}
            />
            <foreignObject x={-7} y={-7} width={14} height={14}>
              <div className="flex h-full w-full items-center justify-center">
                <Icon className={`h-3.5 w-3.5 ${PRESSURE_TONE_CLASSNAME[config.tone]}`} />
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}

function EventHoverTooltip({
  event,
  point,
  homeName,
  awayName,
}: {
  event: HoveredPressureEvent;
  point: PressureTimelinePoint;
  homeName: string;
  awayName: string;
}) {
  const config = resolvePressureEventConfig(event.code, event.name);
  const Icon = config.icon;
  const isHomeEvent = event.mirroredPressure >= 0;
  const pressureValue = isHomeEvent
    ? point.homePressureDisplay
    : point.awayPressureDisplay;
  const left = Math.max(12, Math.min(event.x + 14, 320));
  const top = isHomeEvent
    ? Math.min(event.y + 16, 250)
    : Math.max(event.y - 138, 12);

  return (
    <div
      className="pointer-events-none absolute z-20 w-[240px] border border-zinc-800 bg-black/95 px-4 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.4)] backdrop-blur-sm"
      style={{ left, top }}
    >
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${PRESSURE_TONE_CLASSNAME[config.tone]}`} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Minute {event.eventMinuteLabel}
          </p>
          <p className="mt-1 font-medium text-white">{event.name}</p>
          <p className="text-xs text-zinc-500">{event.teamName}</p>
          {event.playerId ? (
            <p className="mt-1 text-xs text-zinc-400">Player #{event.playerId}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 border-t border-zinc-800 pt-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className={isHomeEvent ? "text-sky-300" : "text-rose-300"}>
            Pressure
          </span>
          <span className="font-semibold text-white">{String(pressureValue)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sky-300">{homeName}</span>
          <span className="font-semibold text-white">{String(point.homePressureDisplay)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-rose-300">{awayName}</span>
          <span className="font-semibold text-white">{String(point.awayPressureDisplay)}</span>
        </div>
      </div>
    </div>
  );
}

interface PressureMarkerLayerProps {
  xAxisMap?: Record<string, { scale?: (value: number) => number }>;
  yAxisMap?: Record<string, { scale?: (value: number) => number }>;
  offset?: { left?: number; top?: number; width?: number; height?: number };
}

type HoveredPressureEvent = PressureEventMarker & {
  x: number;
  y: number;
};
