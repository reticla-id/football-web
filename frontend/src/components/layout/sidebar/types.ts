import type { UserProfile } from "@/lib/supabase/types";

export interface SidebarProps {
  currentUser: UserProfile | null;
  theme: string;
  collapsed: boolean;
  onSearch?: () => void;
  onToggleCollapse: () => void;
  onToggleTheme: () => void;
  onLogout: () => void | Promise<void>;
}

export interface NavItemType {
  href: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

export interface SidebarSection {
  title?: string;
  items: NavItemType[];
}