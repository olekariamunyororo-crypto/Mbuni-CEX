"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { initAnalytics, identify, track, AnalyticsEvents } from "@/lib/analytics/mixpanel";

/**
 * Boots Mixpanel once on the client and identifies authenticated users.
 * Mount inside SessionProvider.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    initAnalytics();
    track(AnalyticsEvents.APP_OPENED, {
      path: typeof window !== "undefined" ? window.location.pathname : "/",
    });
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const user = session.user as {
      id?: string;
      email?: string | null;
      name?: string | null;
      tier?: number;
      onboardingComplete?: boolean;
    };
    const id = user.id || user.email;
    if (!id) return;
    identify(id, {
      $email: user.email ?? undefined,
      $name: user.name ?? undefined,
      tier: user.tier ?? undefined,
      onboarding_complete: user.onboardingComplete ?? false,
    });
  }, [session, status]);

  return <>{children}</>;
}
