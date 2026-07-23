import {Home, Newspaper, Users, CalendarDays, Trophy, Swords, BrainCircuit, Radar, Shield, Palette, BookOpenText, ChevronsLeftRightEllipsis, TrendingUp } from "lucide-react";

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
        badge: "Soon",
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
        badge: "New",
      },
      {
        href: "/leagues",
        label: "Leagues",
        icon: Trophy,
      },
    ],
  },
  {
    title: "Labs",
    items: [
      {
        href: "/analytics",
        label: "Analytics",
        icon: TrendingUp,
        badge: "Soon",
      },
      {
        href: "/radar",
        label: "Radar",
        icon: Radar,
        badge: "New",
      },
      {
        href: "/match-up",
        label: "Match Up",
        icon: Swords,
        badge: "New",
      },
      {
        href: "/simulation",
        label: "Simulation",
        icon: BrainCircuit,
        badge: "Soon",
      },
      {
        href: "/studio",
        label: "Studio",
        icon: Palette,
        badge: "Soon",
      },
    ],
  },
  {
    title: "Extras",
    items: [
      {
        href: "/labs/apis",
        label: "API",
        icon: ChevronsLeftRightEllipsis,
        badge: "Soon",
      },
      {
        href: "/labs/documentations",
        label: "Docs",
        icon: BookOpenText,
        badge: "Soon",
      },
    ],
  },
];
