import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PITCH_LENGTH, PITCH_WIDTH } from "./pitch-utils";

interface PitchSurfaceProps {
  children?: ReactNode;
  className?: string;
}

export default function PitchSurface({ children, className }: PitchSurfaceProps) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[68/105] w-full max-w-[420px] overflow-hidden border border-zinc-800 bg-[#0b120d]",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${PITCH_WIDTH} ${PITCH_LENGTH}`}
        className="h-full w-full"
        role="img"
        aria-label="Football pitch visualization"
      >
        <defs>
          <linearGradient id="pitch-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#122117" />
            <stop offset="100%" stopColor="#0a140d" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={PITCH_WIDTH} height={PITCH_LENGTH} fill="url(#pitch-grass)" />

        {Array.from({ length: 10 }).map((_, index) => (
          <rect
            key={index}
            x="0"
            y={(PITCH_LENGTH / 10) * index}
            width={PITCH_WIDTH}
            height={PITCH_LENGTH / 10}
            fill={index % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)"}
          />
        ))}

        {children}

        <g
          fill="none"
          stroke="rgba(244,244,245,0.82)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.6"
        >
          <rect x="1" y="1" width={PITCH_WIDTH - 2} height={PITCH_LENGTH - 2} />
          <line x1="1" y1={PITCH_LENGTH / 2} x2={PITCH_WIDTH - 1} y2={PITCH_LENGTH / 2} />
          <circle cx={PITCH_WIDTH / 2} cy={PITCH_LENGTH / 2} r="9.15" />
          <circle cx={PITCH_WIDTH / 2} cy={PITCH_LENGTH / 2} r="0.55" fill="rgba(244,244,245,0.82)" />

          <rect x="13.84" y="1" width="40.32" height="16.5" />
          <rect x="24.84" y="1" width="18.32" height="5.5" />
          <circle cx={PITCH_WIDTH / 2} cy="11" r="0.55" fill="rgba(244,244,245,0.82)" />
          <path d="M24.84 17.5 A9.15 9.15 0 0 0 43.16 17.5" />

          <rect x="13.84" y={PITCH_LENGTH - 17.5} width="40.32" height="16.5" />
          <rect x="24.84" y={PITCH_LENGTH - 6.5} width="18.32" height="5.5" />
          <circle
            cx={PITCH_WIDTH / 2}
            cy={PITCH_LENGTH - 11}
            r="0.55"
            fill="rgba(244,244,245,0.82)"
          />
          <path d="M24.84 87.5 A9.15 9.15 0 0 1 43.16 87.5" />

          <rect x="30.34" y="-1.2" width="7.32" height="2.2" />
          <rect x="30.34" y={PITCH_LENGTH - 1} width="7.32" height="2.2" />
        </g>
      </svg>
    </div>
  );
}
