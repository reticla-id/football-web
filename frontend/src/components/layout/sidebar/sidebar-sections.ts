import {Home, Newspaper, Users, CalendarDays, LineChart, Swords, Dna, Radar, Shield } from "lucide-react";

import type { SidebarSection } from "./types";

export const SECTIONS: SidebarSection[] = [
  {
    items: [
      {
        href: "/",
        label: "Home",
        icon: Home,
        end: true,
      },
      {
        href: "/news",
        label: "News",
        icon: Newspaper,
      },
    ],
  },
  {
    title: "Explorers",
    items: [
      {
        href: "/players",
        label: "Players",
        icon: Users,
      },
      {
        href: "/teams",
        label: "Teams",
        icon: Shield,
      },
      {
        href: "/fixtures",
        label: "Fixtures",
        icon: CalendarDays,
      },
      {
        href: "/analytics",
        label: "Analytics",
        icon: LineChart,
      },
    ],
  },
  {
    title: "Labs",
    items: [
      {
        href: "/labs/match-up",
        label: "Match Up",
        icon: Swords,
      },
      {
        href: "/labs/dna",
        label: "DNA",
        icon: Dna,
      },
      {
        href: "/labs/radar",
        label: "Radar",
        icon: Radar,
      },
    ],
  },
];