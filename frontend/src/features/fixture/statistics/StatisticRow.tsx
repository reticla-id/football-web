import type { PreparedStatisticItem } from "./statistic-utils";
import { getComparisonTone } from "./statistic-utils";

export default function StatisticRow({ item }: { item: PreparedStatisticItem }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-zinc-800 px-5 py-3 last:border-b-0">
      <div className={`text-left text-sm font-semibold ${getComparisonTone(item.comparison, "home")}`}>
        {item.homeDisplay}
      </div>

      <div className="px-2 text-center text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {item.label}
      </div>

      <div className={`text-right text-sm font-semibold ${getComparisonTone(item.comparison, "away")}`}>
        {item.awayDisplay}
      </div>
    </div>
  );
}
