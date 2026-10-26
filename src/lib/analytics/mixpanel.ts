/**
 * Mbuni CEX — Mixpanel analytics helper (client-only).
 *
 * Safe no-op when NEXT_PUBLIC_MIXPANEL_TOKEN is unset so local/CI builds
 * work without analytics configuration.
 *
 * EU projects: set NEXT_PUBLIC_MIXPANEL_API_HOST=https://api-eu.mixpanel.com
 */

"use client";

import mixpanel from "mixpanel-browser";

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN?.trim() ?? "";
const API_HOST =
  process.env.NEXT_PUBLIC_MIXPANEL_API_HOST?.trim() || "https://api-eu.mixpanel.com";
const DEBUG = process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === "true";

let initialized = false;

export function isAnalyticsEnabled(): boolean {
  return Boolean(TOKEN);
}

export function initAnalytics(): void {
  if (typeof window === "undefined" || initialized || !TOKEN) return;
  mixpanel.init(TOKEN, {
    api_host: API_HOST,
    persistence: "localStorage",
    track_pageview: false,
    ignore_dnt: false,
    debug: DEBUG,
  });
  initialized = true;
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.info("[analytics] Mixpanel initialized", { api_host: API_HOST });
  }
}

export function track(event: string, props?: AnalyticsProps): void {
  if (!TOKEN || typeof window === "undefined") return;
  if (!initialized) initAnalytics();
  const cleaned: Record<string, string | number | boolean> = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null) continue;
      cleaned[k] = v;
    }
  }
  cleaned.env = process.env.NODE_ENV ?? "development";
  mixpanel.track(event, cleaned);
}

export function identify(userId: string, traits?: AnalyticsProps): void {
  if (!TOKEN || typeof window === "undefined" || !userId) return;
  if (!initialized) initAnalytics();
  mixpanel.identify(userId);
  if (traits) {
    const people: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(traits)) {
      if (v === undefined || v === null) continue;
      people[k] = v;
    }
    if (Object.keys(people).length) mixpanel.people.set(people);
  }
}

export function resetAnalytics(): void {
  if (!TOKEN || typeof window === "undefined") return;
  if (!initialized) return;
  mixpanel.reset();
}

/** Canonical event names for the tracking plan. */
export const AnalyticsEvents = {
  APP_OPENED: "App Opened",
  SPLASH_COMPLETED: "Splash Completed",
  WELCOME_COMPLETED: "Welcome Completed",
  SIGNUP_STARTED: "Signup Started",
  SIGNUP_COMPLETED: "Signup Completed",
  LOGIN_COMPLETED: "Login Completed",
  LOGIN_FAILED: "Login Failed",
  PASSKEY_SIGNIN: "Passkey Sign In",
  ONBOARDING_STEP_VIEWED: "Onboarding Step Viewed",
  ONBOARDING_COMPLETED: "Onboarding Completed",
  PAIR_SELECTED: "Pair Selected",
  ORDER_PLACED: "Order Placed",
  ORDER_REJECTED: "Order Rejected",
  VIEW_CHANGED: "View Changed",
  LOGOUT: "Logout",
} as const;
