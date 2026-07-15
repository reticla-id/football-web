"use client";

import { useState } from "react";

import type { Player } from "@/lib/supabase/types";

import PlayerHeader from "./PlayerHeader";
import PlayerTabs, { type PlayerTab } from "./PlayerTabs";

interface Props {
  player: Player;
}

export default function PlayerDetailClient({ player }: Props) {
  const [tab, setTab] = useState<PlayerTab>("statistics");

  return (
    <>
      <PlayerHeader player={player} />
      <PlayerTabs activeTab={tab} onTabChange={setTab} />

      <section aria-live="polite">
        {tab === "statistics" ? <PlayerTabPanel tab={tab} title="Statistics" /> : null}
        {tab === "analytics" ? <PlayerTabPanel tab={tab} title="Analytics" /> : null}
        {tab === "action-map" ? <PlayerTabPanel tab={tab} title="Action Map" /> : null}
        {tab === "match-history" ? <PlayerTabPanel tab={tab} title="Match History" /> : null}
        {tab === "career-history" ? <PlayerTabPanel tab={tab} title="Career History" /> : null}
      </section>
    </>
  );
}

function PlayerTabPanel({
  tab,
  title,
}: {
  tab: PlayerTab;
  title: string;
}) {
  return (
    <div
      id={`player-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`player-tab-${tab}`}
      className="-[24px] border border-dashed border-zinc-800 bg-zinc-900/60 px-6 py-14 text-center"
    >
      <p className="font-display text-[2rem] leading-none text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-500">
        This section is prepared and will be populated in a future data pass.
      </p>
    </div>
  );
}
