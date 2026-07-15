"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserProfile, signOutSession } from "@/lib/supabase/queries";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, currentUser, setCurrentUser } = useAppStore();

  const authRoutes = ["/sign-in", "/sign-up", "/forgot-password"];
  const isAuthRoute = authRoutes.includes(pathname ?? "");

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setCurrentUser(null);
      return;
    }

    const syncSession = async () => {
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session && !isAuthRoute) {
        router.replace("/sign-in");
        return;
      }

      if (data.session) {
        const { data: profile } = await getCurrentUserProfile();
        setCurrentUser(profile ?? null);
      } else {
        setCurrentUser(null);
      }
    };

    void syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session && !isAuthRoute) {
        router.replace("/sign-in");
      }
      if (session) {
        const { data: profile } = await getCurrentUserProfile();
        setCurrentUser(profile ?? null);
      } else {
        setCurrentUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [isAuthRoute, router, setCurrentUser]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-zinc-100">
      <div className="flex min-h-screen bg-transparent">
        <Sidebar
          currentUser={currentUser}
          theme={theme}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          onLogout={async () => {
            await signOutSession();
            setCurrentUser(null);
            router.push("/sign-in");
          }}
        />

        <main className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_color-mix(in_srgb,var(--accent)_8%,transparent),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.03),_transparent_22%)]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="relative h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
