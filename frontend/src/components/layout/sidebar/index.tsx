"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { SidebarFooter } from "./sidebar-footer";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import type { SidebarProps } from "./types";

export function Sidebar({
  currentUser,
  collapsed,
  onToggleCollapse,
  onSearch,
  theme,
  onToggleTheme,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col border-r border-zinc-800/80 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(8,8,8,0.98))] shadow-[24px_0_60px_rgba(0,0,0,0.22)] transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-6">
        <SidebarLogo collapsed={collapsed} />

        <button
          onClick={onToggleCollapse}
          className="-xl p-2 text-zinc-500 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {!collapsed && onSearch ? (
        <button
          onClick={onSearch}
          className="mx-4 mb-5 mt-4 flex items-center gap-3 -xl border border-zinc-800 bg-zinc-950/75 px-4 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          <Search size={16} />
          Search...
        </button>
      ) : null}

      <div className="flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>

      <SidebarFooter
        collapsed={collapsed}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />
    </aside>
  );
}
