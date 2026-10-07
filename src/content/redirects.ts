export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

/**
 * 301 Redirect Map for historical Wix URLs to new site structure per PRD Section 15.
 *
 * CRITICAL RULE:
 * Populate ONLY from a verified list of real old URLs provided by the owner.
 * Never guess old URLs. If unpopulated, leave as an empty array with TODO.
 */
// TODO: Populate ONLY from real list of old URLs provided by owner; do not guess URLs.
export const redirects: RedirectRule[] = [];
