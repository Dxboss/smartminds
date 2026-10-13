"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";

export interface ConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  embeds: boolean;
}

export interface ConsentContextType {
  preferences: ConsentPreferences;
  hasResponded: boolean;
  isManageOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: Partial<ConsentPreferences>) => void;
  openManage: () => void;
  closeManage: () => void;
}

const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  embeds: true,
};

const CONSENT_STORAGE_KEY = "smartminds_cookie_consent_v1";
const CONSENT_CHANGE_EVENT = "smartminds_consent_updated";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isManageOpen, setIsManageOpen] = useState<boolean>(false);
  const storedJson = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const hasResponded = storedJson !== null;

  const preferences: ConsentPreferences = useMemo(() => {
    if (!storedJson) return DEFAULT_PREFERENCES;
    try {
      const parsed = JSON.parse(storedJson);
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        embeds: Boolean(parsed.embeds),
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }, [storedJson]);

  const storeConsent = (newPrefs: ConsentPreferences) => {
    const finalPrefs = { ...newPrefs, necessary: true };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(finalPrefs));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
      }
    } catch {
      // Storage unavailable fallback
    }
  };

  const acceptAll = () => {
    storeConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      embeds: true,
    });
    setIsManageOpen(false);
  };

  const rejectAll = () => {
    storeConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      embeds: false,
    });
    setIsManageOpen(false);
  };

  const savePreferences = (custom: Partial<ConsentPreferences>) => {
    storeConsent({
      necessary: true,
      analytics: Boolean(custom.analytics),
      marketing: Boolean(custom.marketing),
      embeds: Boolean(custom.embeds),
    });
    setIsManageOpen(false);
  };

  const openManage = () => setIsManageOpen(true);
  const closeManage = () => setIsManageOpen(false);

  return (
    <ConsentContext.Provider
      value={{
        preferences,
        hasResponded,
        isManageOpen,
        acceptAll,
        rejectAll,
        savePreferences,
        openManage,
        closeManage,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = (): ConsentContextType => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
};
