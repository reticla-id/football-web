"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { SidebarFooter } from "./sidebar-footer";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import type { SidebarProps } from "./types";

export function Sidebar({
  currentUser,
  collapsed,
  mobileOpen = false,
  onToggleCollapse,
  onCloseMobile,
  onSearch,
  theme,
  onToggleTheme,
  onLogout,
}: SidebarProps) {
  const mobileCollapsed = false;
  const desktopCollapsed = collapsed;

  const sidebarContent = (
    <aside
      className={`sticky top-0 flex h-screen flex-col border-r border-zinc-800/80 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(8,8,8,0.98))] shadow-[24px_0_60px_rgba(0,0,0,0.22)] transition-all duration-300 ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-5 lg:px-5 lg:py-6">
        <div className="hidden lg:block">
          <SidebarLogo collapsed={desktopCollapsed} />
        </div>

        <div className="lg:hidden">
          <SidebarLogo collapsed={mobileCollapsed} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="hidden p-2 text-zinc-500 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:text-white lg:block"
          >
            {desktopCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onCloseMobile}
            className="p-2 text-zinc-500 transition-all hover:bg-zinc-900 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {onSearch ? (
        <>
          {!desktopCollapsed ? (
            <button
              onClick={onSearch}
              className="mx-4 mb-5 mt-4 hidden items-center gap-3 border border-zinc-800 bg-zinc-950/75 px-4 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white lg:flex"
            >
              <Search size={16} />
              Search...
            </button>
          ) : null}

          <button
            onClick={onSearch}
            className="mx-4 mb-5 mt-4 flex items-center gap-3 border border-zinc-800 bg-zinc-950/75 px-4 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white lg:hidden"
          >
            <Search size={16} />
            Search...
          </button>
        </>
      ) : null}

      <div className="flex-1 overflow-y-auto lg:hidden">
        <SidebarNav
          collapsed={mobileCollapsed}
          onItemSelect={onCloseMobile}
          scope="mobile"
        />
      </div>

      <div className="hidden flex-1 overflow-y-auto lg:block">
        <SidebarNav collapsed={desktopCollapsed} scope="desktop" />
      </div>

      <div className="lg:hidden">
        <SidebarFooter
          collapsed={mobileCollapsed}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
        />
      </div>

      <div className="hidden lg:block">
        <SidebarFooter
          collapsed={desktopCollapsed}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
        />
      </div>
    </aside>
  );

  return (
    <>
      <div className="sticky top-0 hidden h-screen lg:flex">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/65 pointer-events-auto lg:hidden"
              aria-label="Close navigation"
            />

            <motion.div
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[320px] pointer-events-auto lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
