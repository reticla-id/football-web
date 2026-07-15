import type { PreparedStatisticItem } from "./statistic-utils";
import { getComparisonTone, getPossessionWidths } from "./statistic-utils";

export default function PossessionRow({ item }: { item: PreparedStatisticItem }) {
  const { homeWidth, awayWidth } = getPossessionWidths(item);

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

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex justify-end">
          <div className="h-2.5 w-full max-w-[280px] overflow-hidden bg-zinc-950">
            <div
              className="h-full bg-[color:var(--accent)] transition-[width] duration-300"
              style={{ width: `${homeWidth}%` }}
            />
          </div>
        </div>

        <div className="w-4" />

        <div className="flex justify-start">
          <div className="h-2.5 w-full max-w-[280px] overflow-hidden bg-zinc-950">
            <div
              className="ml-auto h-full bg-zinc-400 transition-[width] duration-300"
              style={{ width: `${awayWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
