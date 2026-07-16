"use client";

import Link from "next/link";
import Image from "next/image";

interface SidebarLogoProps {
  collapsed: boolean;
}

export function SidebarLogo({ collapsed }: SidebarLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center">
        <Image
          src="https://i.ibb.co.com/Z6tKqhkm/pantauaja-vector-no-bg.png"
          alt="Reticla"
          width={44}
          height={44}
          className="object-contain"
          priority
        />
      </div>

      {!collapsed ? (
        <div>
          <p className="font-display text-[1.5rem] leading-none text-white">
            RETICLA STUDIO
          </p>

          {/* <p className="mt-1 text-[8px] uppercase tracking-[0.28em] text-zinc-500">
            Football Intelligence
          </p> */}
        </div>
      ) : null}
    </Link>
  );
}
