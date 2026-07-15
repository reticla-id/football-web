"use client";

import Link from "next/link";
import { Radar } from "lucide-react";

interface SidebarLogoProps {
  collapsed: boolean;
}

export function SidebarLogo({ collapsed }: SidebarLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center -2xl">
        <Radar className="h-5 w-5" />
      </div>

      {!collapsed ? (
        <div>
          <p className="font-display text-[1.5rem] leading-none text-white">
            Pitch Studio
          </p>

          {/* <p className="mt-1 text-[8px] uppercase tracking-[0.28em] text-zinc-500">
            Football Intelligence
          </p> */}
        </div>
      ) : null}
    </Link>
  );
}
