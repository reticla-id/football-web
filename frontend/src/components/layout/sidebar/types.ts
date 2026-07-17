import type { UserProfile } from "@/lib/supabase/types";

export interface SidebarProps {
  currentUser: UserProfile | null;
  theme: string;
  collapsed: boolean;
  mobileOpen?: boolean;
  onSearch?: () => void;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
  onToggleTheme: () => void;
  onLogout: () => void | Promise<void>;
}

export interface NavItemType {
  href: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badge?: "Beta" | "Soon" | "New"
}

export interface SidebarSection {
  title?: string;
  items: NavItemType[];
}
