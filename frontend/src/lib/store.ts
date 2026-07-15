import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "./supabase/types";

type ThemeMode = "dark" | "light";

interface AppState {
  theme: ThemeMode;
  selectedLeague: string;
  selectedSeason: string;
  search: string;
  currentUser: UserProfile | null;
  setTheme: (theme: ThemeMode) => void;
  setSelectedLeague: (league: string) => void;
  setSelectedSeason: (season: string) => void;
  setSearch: (search: string) => void;
  setCurrentUser: (user: UserProfile | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      selectedLeague: "All Leagues",
      selectedSeason: "2024/25",
      search: "",
      currentUser: null,
      setTheme: (theme) => set({ theme }),
      setSelectedLeague: (selectedLeague) => set({ selectedLeague }),
      setSelectedSeason: (selectedSeason) => set({ selectedSeason }),
      setSearch: (search) => set({ search }),
      setCurrentUser: (currentUser) => set({ currentUser }),
    }),
    { name: "football-analytics-store" },
  ),
);
