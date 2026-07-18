"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { NavigationFeedback } from "@/components/layout/navigation-feedback";
import { Sidebar } from "@/components/layout/sidebar";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserProfile, signOutSession } from "@/lib/supabase/queries";

const NAVIGATION_MIN_VISIBLE_MS = 180;
const NAVIGATION_FAILSAFE_MS = 10000;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme, currentUser, setCurrentUser } = useAppStore();

  const authRoutes = ["/sign-in", "/sign-up", "/forgot-password"];
  const isAuthRoute = authRoutes.includes(pathname ?? "");

  const [collapsed, setCollapsed] = useState(false);
  const [navigationPending, setNavigationPending] = useState<{
    startedAt: number;
    sourceRouteKey: string;
  } | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);
  const navigationFailsafeRef = useRef<number | null>(null);

  const routeKey = useMemo(() => {
    const params = searchParams.toString();
    return `${pathname ?? ""}${params ? `?${params}` : ""}`;
  }, [pathname, searchParams]);

  const isNavigationFeedbackVisible = navigationPending !== null;

  const clearNavigationTimeouts = useCallback(() => {
    if (navigationTimeoutRef.current !== null) {
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    if (navigationFailsafeRef.current !== null) {
      window.clearTimeout(navigationFailsafeRef.current);
      navigationFailsafeRef.current = null;
    }
  }, []);

  const startNavigationFeedback = useCallback(
    (href: string) => {
      if (typeof window === "undefined") {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const destinationUrl = new URL(href, currentUrl);
      const destinationRouteKey = `${destinationUrl.pathname}${destinationUrl.search}`;

      if (
        destinationUrl.origin !== currentUrl.origin ||
        destinationRouteKey === routeKey
      ) {
        return;
      }

      clearNavigationTimeouts();

      const startedAt = Date.now();
      setNavigationPending({
        startedAt,
        sourceRouteKey: routeKey,
      });

      navigationFailsafeRef.current = window.setTimeout(() => {
        setNavigationPending(null);
      }, NAVIGATION_FAILSAFE_MS);
    },
    [clearNavigationTimeouts, routeKey]
  );

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
        router.replace("/sign-in?reason=session-expired");
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
        router.replace("/sign-in?reason=session-expired");
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      startNavigationFeedback(anchor.href);
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [startNavigationFeedback]);

  useEffect(() => {
    if (!navigationPending || navigationPending.sourceRouteKey === routeKey) {
      return undefined;
    }

    clearNavigationTimeouts();

    const elapsed = Date.now() - navigationPending.startedAt;
    const remaining = Math.max(0, NAVIGATION_MIN_VISIBLE_MS - elapsed);

    navigationTimeoutRef.current = window.setTimeout(() => {
      setNavigationPending(null);
      navigationTimeoutRef.current = null;
    }, remaining);

    return clearNavigationTimeouts;
  }, [clearNavigationTimeouts, navigationPending, routeKey]);

  useEffect(() => clearNavigationTimeouts, [clearNavigationTimeouts]);

  if (isAuthRoute) {
    return (
      <>
        <NavigationFeedback visible={isNavigationFeedbackVisible} />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-zinc-100">
      <NavigationFeedback visible={isNavigationFeedbackVisible} />

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
            startNavigationFeedback("/sign-in");
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
