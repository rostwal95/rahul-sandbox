import posthog from "posthog-js";

let inited = false;
export function initAnalytics() {
  if (inited) return;
  if (typeof window === "undefined") return;
  // Placeholder key; replace with real key if integrating PostHog
  posthog.init("phc_YOUR_KEY", {
    api_host: "https://app.posthog.com",
    capture_pageview: false,
    loaded: () => {
      inited = true;
    },
  });
}

export function track(event: string, properties?: Record<string, any>) {
  try {
    posthog.capture(event, properties);
  } catch {}
}
