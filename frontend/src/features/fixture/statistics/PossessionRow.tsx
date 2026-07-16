import type { PreparedStatisticItem } from "./statistic-utils";
import { getComparisonTone, getPossessionWidths } from "./statistic-utils";

export default function PossessionRow({ item }: { item: PreparedStatisticItem }) {
  const { homeWidth, awayWidth } = getPossessionWidths(item);
  const homeHalfWidth = homeWidth / 2;
  const awayHalfWidth = awayWidth / 2;
  const home = Number(item.homeValue);
  const away = Number(item.awayValue);

  const homeBar =
    home > away
      ? "bg-[color:var(--accent)]"
      : home < away
        ? "bg-zinc-400"
        : "bg-[color:var(--accent)]";

  const awayBar =
    away > home
      ? "bg-[color:var(--accent)]"
      : away < home
        ? "bg-zinc-400"
        : "bg-[color:var(--accent)]";

  return (
    <div className="space-y-5 border-b border-zinc-800 px-5 py-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className={`text-left font-display text-[2.15rem] leading-none ${getComparisonTone(item.comparison, "home")}`}>
          {item.homeDisplay}
        </div>

        <div className="px-2 text-center text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
          {item.label}
        </div>

        <div className={`text-right font-display text-[2.15rem] leading-none ${getComparisonTone(item.comparison, "away")}`}>
          {item.awayDisplay}
        </div>
      </div>

      <div className="px-1">
        <div className="relative h-2.5 overflow-hidden bg-zinc-950">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-800" />
          <div
            className={`absolute inset-y-0 right-1/2 transition-[width] duration-300 ${homeBar}`}
            style={{ width: `${homeHalfWidth}%` }}
          />
          <div
            className={`absolute inset-y-0 left-1/2 transition-[width] duration-300 ${awayBar}`}
            style={{ width: `${awayHalfWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
