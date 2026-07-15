import { CalendarDays, MapPin } from "lucide-react";

import type { TeamFixture } from "@/types/fixture";

interface Props {
  fixture: TeamFixture;
}

export default function FixtureCardFinished({ fixture }: Props) {
  const kickoff = new Date(fixture.starting_at);

  return (
    <article className="border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.96))] px-5 py-4 transition-colors duration-200 hover:border-zinc-600">

      <div className="grid grid-cols-[44px_1fr] gap-4">

        {/* League */}
        <div className="flex items-center justify-center">
          <img
            src={fixture.league.image_path ?? "/placeholder-club.png"}
            alt={fixture.league.name}
            className="h-10 w-10 object-contain"
          />
        </div>

        {/* Main */}
        <div className="space-y-2">

          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
            Match Week
          </p>

          <div className="relative flex items-center">

            {/* HOME */}
            <div className="flex flex-1 justify-end pr-16">
              <FinishedParticipant
                name={fixture.home.name}
                image={fixture.home.image_path}
                winner={fixture.home.winner}
                align="left"
              />
            </div>

            {/* SCORE */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <p className="font-display text-[30px] font-bold leading-none tracking-tight text-white whitespace-nowrap">
                {fixture.home.goals ?? 0}
                <span className="mx-1 text-zinc-600">-</span>
                {fixture.away.goals ?? 0}
              </p>
            </div>

            {/* AWAY */}
            <div className="flex flex-1 justify-start pl-16">
              <FinishedParticipant
                name={fixture.away.name}
                image={fixture.away.image_path}
                winner={fixture.away.winner}
                align="right"
              />
            </div>

          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>{fixture.venue_name ?? "-"}</span>

            <span className="text-zinc-700">•</span>

            <CalendarDays className="h-3.5 w-3.5" />

            <span className="text-zinc-400">
              {kickoff.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

        </div>

      </div>

    </article>
  );
}

function FinishedParticipant({
  name,
  image,
  winner,
  align,
}: {
  name: string;
  image: string | null;
  winner: boolean | null;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div className="flex items-center gap-2 min-w-0">

      {!isRight && (
        <img
          src={image ?? "/placeholder-club.png"}
          alt={name}
          className="h-9 w-9 shrink-0 object-contain"
        />
      )}

      <span
        className={[
          "min-w-0 text-sm",
          winner ? "font-semibold text-white" : "font-medium text-zinc-300",
          isRight ? "text-left" : "text-right",
        ].join(" ")}
      >
        {name}
      </span>

      {isRight && (
        <img
          src={image ?? "/placeholder-club.png"}
          alt={name}
          className="h-9 w-9 shrink-0 object-contain"
        />
      )}

    </div>
  );
}