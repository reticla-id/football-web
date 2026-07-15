"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { SECTIONS } from "./sidebar-sections";
import { SidebarNavItem } from "./sidebar-nav-item";

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  return (
    <LayoutGroup id="sidebar-nav">
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {SECTIONS.map((section) => (
          <motion.div
            key={section.title ?? "main"}
            layout
            animate={{ marginBottom: collapsed ? 16 : 28 }}
            transition={{ duration: 0.25 }}
          >
            <AnimatePresence initial={false}>
              {!collapsed && section.title ? (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-600"
                >
                  {section.title}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </div>
          </motion.div>
        ))}
      </nav>
    </LayoutGroup>
  );
}
