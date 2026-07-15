"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItemType } from "./types";

interface SidebarNavItemProps {
  item: NavItemType;
  collapsed: boolean;
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const pathname = usePathname();

  const active = item.end ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18 }}>
      <Link
        href={item.href}
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
          <span
            className={`relative z-10 font-medium transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-white"
            }`}
          >
            {item.label}
          </span>
        ) : null}
      </Link>
    </motion.div>
  );
}
