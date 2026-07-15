"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { Home, Newspaper, Users, CalendarDays, LineChart, Swords, Dna, Radar, Settings, User, Zap, Search, Shield, Moon, LogOut, PanelLeftClose, PanelLeftOpen, ChevronUp } from "lucide-react";
import type { UserProfile } from "@/lib/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  currentUser: UserProfile | null;
  theme: string;
  collapsed: boolean;

  onToggleCollapse: () => void;
  onSearch?: () => void;
  onToggleTheme: () => void;
  onLogout: () => void | Promise<void>;
}

interface NavItemType {
  href: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const SECTIONS: {
  title?: string;
  items: NavItemType[];
}[] = [
  {
    items: [
      {
        href: "/",
        label: "Home",
        icon: Home,
        end: true,
      },
      {
        href: "/news",
        label: "News",
        icon: Newspaper,
      },
    ],
  },
  {
    title: "Manage",
    items: [
      {
        href: "/players",
        label: "Players",
        icon: Users,
      },
      {
        href: "/teams",
        label: "Teams",
        icon: Shield,
      },
      {
        href: "/fixtures",
        label: "Fixtures",
        icon: CalendarDays,
      },
      {
        href: "/analytics",
        label: "Analytics",
        icon: LineChart,
      },
    ],
  },
  {
    title: "Labs",
    items: [
      {
        href: "/labs/match-up",
        label: "Match Up",
        icon: Swords,
      },
      {
        href: "/labs/dna",
        label: "DNA",
        icon: Dna,
      },
      {
        href: "/labs/radar",
        label: "Radar",
        icon: Radar,
      },
    ],
  },
];

function NavItem({ item }: { item: NavItemType }) {
  const pathname = usePathname();

  const active = item.end
    ? pathname === item.href
    : pathname.startsWith(item.href);

  const Icon = item.icon;

  return (
    <motion.div
        whileHover={{
            x:4
        }}
        whileTap={{
            scale:.98
        }}
        transition={{
            duration:.18
        }}
    >
      <Link
        href={item.href}
        className="
          group
          relative
          flex
          items-center
          gap-3
          overflow-hidden
          -xl
          px-3
          py-3
          text-base
          transition-colors
        "
      >
        {active && (
          <motion.div
              layoutId="sidebar-active"
              className="
                  absolute
                  inset-0
                  -xl
                  bg-white/8
                  dark:bg-white/6
                  border
                  border-white/10
              "
              transition={{
                  type:"spring",
                  stiffness:520,
                  damping:38
              }}
          />
        )}

        <motion.div
            whileHover={{
                rotate: -8,
                scale: 1.12
            }}
            whileTap={{ scale:0.97 }}
            transition={{
                duration: .2
            }}
            className="relative z-10"
        >
            <Icon
                className={`
                    h-[18px]
                    w-[18px]
                    ${
                        active
                            ? "text-[color:var(--accent)]"
                            : "text-zinc-500 group-hover:text-[color:var(--accent)]"
                    }
                `}
            />
        </motion.div>

        <span
          className={`
            relative z-10 font-medium transition-colors
            ${
              active
                ? "text-white"
                : "text-zinc-400 group-hover:text-white"
            }
          `}
        >
          {item.label}
        </span>
      </Link>
    </motion.div>
  );
}

export function Sidebar({
  currentUser,
  theme,
  collapsed,
  onToggleCollapse,
  onSearch,
  onToggleTheme,
  onLogout,
}: SidebarProps) {
  return (
          <aside
              className={`
                sticky
                top-0
                flex
                h-screen
                flex-col
                bg-gradient-to-b
                from-zinc-950
                via-zinc-950
                to-zinc-900
                shadow-[4px_0_32px_rgba(0,0,0,.35)]
                transition-all
                duration-300
                ${collapsed ? "w-20" : "w-72"}
              `}
            >

      {/* Logo */}

      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div
            className="
              flex h-11 w-11 items-center justify-center
              -xl
              accent-bg-soft
              accent-text
              transition
              group-hover:scale-105
            "
          >
            <Zap className="h-5 w-5" fill="currentColor" />
          </div>

          <AnimatePresence>
              {!collapsed && (
                  <motion.div
                      initial={{opacity:0,x:-10}}
                      animate={{opacity:1,x:0}}
                      exit={{opacity:0,x:-10}}
                  >
                      <p className="font-semibold text-white">
                          Pitch Studio
                      </p>

                      <p className="text-sm text-zinc-500">
                          Football Intelligence
                      </p>
                  </motion.div>
              )}
          </AnimatePresence>
        </Link>
        <button
            onClick={onToggleCollapse}
            className="
                -lg
                p-2
                text-zinc-500
                transition
                hover:bg-zinc-900
                hover:text-white
            "
        >
            {collapsed ? (
                <PanelLeftOpen className="h-5 w-5"/>
            ) : (
                <PanelLeftClose className="h-5 w-5"/>
            )}
        </button>
      </div>

      {/* Search */}

      {onSearch && (
        <button
          onClick={onSearch}
          className="
            mx-4 mb-6
            flex h-11 items-center gap-3
            -xl
            bg-zinc-900
            px-4
            text-base text-zinc-400
            transition-all duration-200

            hover:bg-zinc-800
            hover:text-white
            hover:shadow-[0_0_0_1px_rgba(16,185,129,.15)]
          "
        >
          <Search className="h-4 w-4" />

          <span className="flex-1 text-left">
            Search...
          </span>

          <kbd className="-md bg-zinc-800 px-2 py-1 text-[10px] text-zinc-500">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-4 no-scrollbar">
        {SECTIONS.map((section) => (
          <motion.div
            key={section.title ?? "main"}
            layout
            animate={{
              marginBottom: collapsed ? 16 : 32,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <AnimatePresence initial={false}>
              {!collapsed && section.title && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: -4,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                  className="
                    mb-2
                    px-3
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-zinc-600
                  "
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}

      <motion.div
          layout
          className="
              mt-auto
              border-t
              border-white/[0.05]
              bg-zinc-950/80
              backdrop-blur-xl
              p-4
          "
      >

          {/* User */}

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    -xl
                    bg-zinc-900
                    p-3
                    transition
                    hover:bg-zinc-800
                  "
                >
                  <div
                    className="
                      flex h-10 w-10 items-center justify-center
                      -full
                      accent-bg-soft
                      font-semibold
                      accent-text
                    "
                  >
                    {(currentUser?.username ??
                      currentUser?.email?.charAt(0) ??
                      "G"
                    ).toUpperCase()}
                  </div>

                  {!collapsed && (
                    <>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate font-medium text-white">
                          {currentUser?.username ??
                            currentUser?.email?.split("@")[0] ??
                            "Guest"}
                        </p>

                        <p className="truncate text-sm text-zinc-500">
                          {currentUser?.email}
                        </p>
                      </div>

                      <ChevronUp className="h-4 w-4 text-zinc-500" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="end"
                className="
                  w-60
                  border-zinc-800
                  bg-zinc-950
                  text-white
                "
              >
              <div className="px-3 py-2">
                <p className="font-medium">
                  {currentUser?.username ??
                    currentUser?.email?.split("@")[0]}
                </p>

                <p className="text-xs text-zinc-500">
                  {currentUser?.email}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onLogout}
                className="text-red-400 focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu */}

          

      </motion.div>
    </aside>
  );
}
