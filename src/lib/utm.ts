export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const STORAGE_KEY = "smartminds_utm_attribution";

/**
 * Reads UTM parameters from the current URL and persists them if present.
 * Does not overwrite existing first-touch attribution within the same session.
 */
export function captureUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get("utm_source");
    const utm_medium = urlParams.get("utm_medium");
    const utm_campaign = urlParams.get("utm_campaign");
    const utm_term = urlParams.get("utm_term");
    const utm_content = urlParams.get("utm_content");

    if (utm_source || utm_medium || utm_campaign || utm_term || utm_content) {
      const params: UtmParams = {
        utm_source: utm_source || undefined,
        utm_medium: utm_medium || undefined,
        utm_campaign: utm_campaign || undefined,
        utm_term: utm_term || undefined,
        utm_content: utm_content || undefined,
      };

      // Store in sessionStorage (session level) and fallback localStorage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
      return params;
    }
  } catch {
    // Graceful fallback for privacy/incognito modes
  }

  return getStoredUtmParams();
}

/**
 * Retrieves persisted first-touch UTM attribution parameters.
 */
export function getStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  try {
    const stored =
      sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UtmParams;
    }
  } catch {
    // Ignore parse errors
  }

  return {};
}
