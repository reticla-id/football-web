import { CalendarDays, MapPin } from "lucide-react";

import type { TeamFixture } from "@/types/fixture";

interface Props {
  fixture: TeamFixture;
}

export default function FixtureCardFinished({ fixture }: Props) {
  const kickoff = new Date(fixture.starting_at);

  return (
    <article className="border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.96))] px-4 py-3 transition-colors duration-200 hover:border-zinc-600 sm:px-5">
      <div className="space-y-2.5">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Match Week
        </p>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <FinishedParticipant
            name={fixture.home.name}
            image={fixture.home.image_path}
            winner={fixture.home.winner}
            align="left"
          />

          <div className="min-w-[88px] px-1 text-center">
            <p className="font-display text-[1.6rem] leading-none tracking-tight text-white">
              {fixture.home.goals ?? 0}
              <span className="mx-1 text-zinc-600">-</span>
              {fixture.away.goals ?? 0}
            </p>
          </div>

          <FinishedParticipant
            name={fixture.away.name}
            image={fixture.away.image_path}
            winner={fixture.away.winner}
            align="right"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{fixture.venue_name ?? "-"}</span>
          <span className="text-zinc-700">&bull;</span>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="text-zinc-400">
            {kickoff.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
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
    <div
      className={`flex min-w-0 items-center gap-2 ${
        isRight ? "justify-start" : "justify-end"
      }`}
    >
      {isRight ? (
        <>
          <img
            src={image ?? "/placeholder-club.png"}
            alt={name}
            className="h-9 w-9 shrink-0 object-contain"
          />
          <span
            className={[
              "truncate text-left text-sm",
              winner ? "font-semibold text-white" : "font-medium text-zinc-300",
            ].join(" ")}
          >
            {name}
          </span>
        </>
      ) : (
        <>
          <span
            className={[
              "truncate text-right text-sm",
              winner ? "font-semibold text-white" : "font-medium text-zinc-300",
            ].join(" ")}
          >
            {name}
          </span>
          <img
            src={image ?? "/placeholder-club.png"}
            alt={name}
            className="h-9 w-9 shrink-0 object-contain"
          />
        </>
      )}
    </div>
  );
}
