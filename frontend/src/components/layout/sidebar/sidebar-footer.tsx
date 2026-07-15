"use client";

import { SidebarUser } from "./sidebar-user";

interface SidebarFooterProps {
  collapsed: boolean;
  currentUser: any;
  theme: string;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function SidebarFooter({
  collapsed,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
}: SidebarFooterProps) {
  return (
    <footer className="border-t border-zinc-800/70 bg-zinc-950/80 p-3">
      <SidebarUser
        currentUser={currentUser}
        collapsed={collapsed}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />
    </footer>
  );
}
