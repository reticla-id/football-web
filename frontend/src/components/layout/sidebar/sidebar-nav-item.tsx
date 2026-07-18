"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItemType } from "./types";

interface SidebarNavItemProps {
  item: NavItemType;
  collapsed: boolean;
  onSelect?: () => void;
}

const badgeStyles: Record<string, string> = {
  new: "text-red-400 group-hover:text-red-300",
  soon: "text-sky-400 group-hover:text-sky-300",
  beta: "text-amber-400 group-hover:text-amber-300",
  alpha: "text-purple-400 group-hover:text-purple-300",
};

export function SidebarNavItem({ item, collapsed, onSelect }: SidebarNavItemProps) {
  const pathname = usePathname();
  const radarAliasMatch =
    item.href === "/radar" &&
    (pathname.startsWith("/radar") || pathname.startsWith("/labs/radar"));
  const active = radarAliasMatch
    ? true
    : item.end
      ? pathname === item.href
      : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18 }}>
      <Link
        href={item.href}
        onClick={onSelect}
        className="group relative flex items-center gap-3 overflow-hidden -xl px-3.5 py-3 text-base transition-colors"
      >
        {active ? (
          <motion.div
            layoutId="sidebar-active"
            className="accent-bg-soft absolute inset-0 -xl"
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 38,
            }}
          />
        ) : null}

        <motion.div
          whileHover={{ rotate: -6, scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          className="relative z-10"
        >
          <Icon
            className={`h-[18px] w-[18px] ${
              active ? "accent-text" : "text-zinc-500 group-hover:text-zinc-200"
            }`}
          />
        </motion.div>

        {!collapsed ? (
          <div className="relative z-10 flex items-start gap-1">
            <span
              className={`font-display text-[18px] font-medium tracking-[0.04em] transition-colors ${
                active ? "text-white" : "text-zinc-400 group-hover:text-white"
              }`}
            >
              {item.label}
            </span>

            {item.badge && (
              <sup
                className={`font-display text-[12px] font-semibold uppercase tracking-[0.12em] ${
                  badgeStyles[item.badge?.toLowerCase() ?? ""] ??
                  (active
                    ? "accent-text"
                    : "text-zinc-500 group-hover:text-zinc-300")
                }`}
              >
                {item.badge}
              </sup>
            )}
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
