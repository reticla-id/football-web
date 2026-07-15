import { CalendarDays, Clock3, MapPin } from "lucide-react";

import type { TeamFixture } from "@/types/fixture";

interface Props {
  fixture: TeamFixture;
}

export default function FixtureCardUpcoming({ fixture }: Props) {
  const kickoff = new Date(fixture.starting_at);

  return (
    <article className="border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.96))] px-4 py-3 transition-colors duration-200 hover:border-zinc-600 sm:px-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1.5">
        <img
          src={fixture.league.image_path ?? "/placeholder-club.png"}
          alt={`${fixture.league.name} logo`}
          className="row-span-3 h-7 w-7 self-center object-contain"
          loading="lazy"
          decoding="async"
        />

        <div className="flex justify-center">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Match Week
          </p>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2">
          <FixtureParticipant
            name={fixture.home.name}
            image={fixture.home.image_path}
            align="left"
          />

          <div className="flex min-w-[76px] flex-col items-center justify-center px-1 text-center">
            <div className="flex items-center justify-center gap-1 text-zinc-500">
              <Clock3 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                KO
              </span>
            </div>
            <p className="font-display mt-1 text-[1.5rem] leading-none text-white">
              {kickoff.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <FixtureParticipant
            name={fixture.away.name}
            image={fixture.away.image_path}
            align="right"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{fixture.venue_name ?? "-"}</span>
          <span className="text-zinc-700">&bull;</span>
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
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

function FixtureParticipant({
  name,
  image,
  align,
}: {
  name: string;
  image: string | null;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div
      className={`flex min-w-0 max-w-[40%] items-center gap-1.5 ${
        isRight ? "justify-end" : "justify-start"
      }`}
    >
      {isRight ? (
        <>
          <span className="truncate text-right text-sm font-medium text-white">
            {name}
          </span>
          <img
            src={image ?? "/placeholder-club.png"}
            alt={`${name} crest`}
            className="h-9 w-9 shrink-0 object-contain"
            loading="lazy"
            decoding="async"
          />
        </>
      ) : (
        <>
          <img
            src={image ?? "/placeholder-club.png"}
            alt={`${name} crest`}
            className="h-9 w-9 shrink-0 object-contain"
            loading="lazy"
            decoding="async"
          />
          <span className="truncate text-sm font-medium text-white">{name}</span>
        </>
      )}
    </div>
  );
}
