"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const username = currentUser?.username ?? currentUser?.email?.split("@")[0] ?? "Guest";
  const email = currentUser?.email ?? "No email";
  const avatar = (username[0] ?? "G").toUpperCase();
  const confirmModal =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {confirmOpen ? (
              <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-full max-w-md border border-zinc-800 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-400">
                      Confirm Action
                    </p>
                    <h2 className="mt-2 font-display text-[1.9rem] leading-none text-white">
                      Log out?
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      You&apos;ll be signed out from your current session and returned to
                      the authentication flow.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                    <Button
                      type="button"
                      onClick={() => setConfirmOpen(false)}
                      className="w-full border border-zinc-700 bg-zinc-800 text-zinc-100 transition-colors hover:bg-zinc-700 sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={onLogout}
                      className="w-full border border-rose-500 bg-rose-600 text-white transition-colors sm:w-auto"
                    >
                      Logout
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
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

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="text-rose-500 focus:text-rose-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {confirmModal}
    </>
  );
}
