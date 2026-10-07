"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/utm";

/**
 * UtmTracker: Mounts quietly in layout and captures UTM search parameters
 * on first page load for multi-channel attribution.
 */
export const UtmTracker = () => {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return null;
};
