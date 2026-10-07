export type AnalyticsEvent = "lead_submitted" | "call_booked";

interface WindowWithDataLayer extends Window {
  dataLayer?: Array<Record<string, unknown>>;
}

/**
 * Dispatches an analytics event to Google Tag Manager / GA4 dataLayer
 * if available, and emits a custom DOM event for testing.
 */
export function trackEvent(
  eventName: AnalyticsEvent,
  payload?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const eventData = {
    event: eventName,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  const win = window as unknown as WindowWithDataLayer;
  if (win.dataLayer) {
    win.dataLayer.push(eventData);
  }

  // Also dispatch browser event
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: payload,
    })
  );
}
