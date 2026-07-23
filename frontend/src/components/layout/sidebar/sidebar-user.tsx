"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut, Moon, Settings, User } from "lucide-react";

import type { UserProfile } from "@/lib/supabase/types";

interface SidebarUserProps {
  currentUser: UserProfile | null;
  theme: string;
  collapsed: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function SidebarUser({
  currentUser,
  theme,
  collapsed,
  onToggleTheme,
  onLogout,
}: SidebarUserProps) {
  const username = currentUser?.username ?? currentUser?.email?.split("@")[0] ?? "Guest";
  const email = currentUser?.email ?? "No email";
  const avatar = (username[0] ?? "G").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center border border-[color:var(--accent-secondary)]/55 text-[color:var(--accent-secondary)] transition-all hover:border-[color:var(--accent-secondary)] ${
            collapsed
              ? "mx-auto h-16 w-16 justify-center p-0"
              : "w-full gap-3 p-3"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center -full bg-[color:var(--accent-secondary)] font-semibold text-black">
            {avatar}
          </div>

          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-white">{username}</p>
                <p className="truncate text-xs text-zinc-400">{email}</p>
              </div>

              <ChevronsUpDown className="h-4 w-4 text-[color:var(--accent-secondary)]" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="end" sideOffset={10} className="w-60 -xl">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-white">{username}</p>
          <p className="text-xs text-zinc-500">{email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onToggleTheme}>
          <Moon className="mr-2 h-4 w-4" />
          Theme ({theme})
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
