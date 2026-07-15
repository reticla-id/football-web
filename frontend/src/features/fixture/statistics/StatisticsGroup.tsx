import StatisticRow from "./StatisticRow";
import StatisticsSection from "./StatisticsSection";
import StatisticsSectionHeader from "./StatisticsSectionHeader";
import type { PreparedStatisticsGroup } from "./statistic-utils";

export default function StatisticsGroup({ group }: { group: PreparedStatisticsGroup }) {
  return (
    <StatisticsSection>
      <StatisticsSectionHeader title={group.section} />
      <div>
        {group.items.map((item) => (
          <StatisticRow key={item.code} item={item} />
        ))}
      </div>
    </StatisticsSection>
  );
}
