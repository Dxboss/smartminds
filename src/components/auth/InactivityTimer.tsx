"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOutDemo } from "@/app/login/actions";
import { Icon } from "@/components/ui/Icon";

// Inactivity configuration (in milliseconds)
// 14 minutes before warning, 60 seconds countdown modal = 15 minutes total idle limit
const INACTIVITY_TIMEOUT_MS = 14 * 60 * 1000;
const WARNING_COUNTDOWN_SECONDS = 60;

export const InactivityTimer: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_COUNTDOWN_SECONDS);

  const lastActivityRef = useRef<number>(0);
  const timerCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSignOutDueToInactivity = useCallback(async () => {
    setShowWarning(false);
    try {
      await signOutDemo();
    } catch {
      // Ignore network errors on signout
    }
    try {
      localStorage.removeItem("smartminds_auth_session_v1");
      window.dispatchEvent(new Event("smartminds_auth_updated"));
    } catch {}
    window.location.href = "/login?reason=timeout";
  }, []);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(WARNING_COUNTDOWN_SECONDS);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [showWarning]);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    // If not authenticated or user explicitly chose "Keep me signed in", disable auto-logout
    if (!isAuthenticated || !user || user.keepSignedIn === true) {
      setShowWarning(false);
      return;
    }

    const activityEvents = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
    ];

    const onUserActivity = () => {
      // Only reset automatically if warning is not active; once warning is up, user must click button
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });

    // Check every 5 seconds for inactivity
    timerCheckIntervalRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_TIMEOUT_MS && !showWarning) {
        setShowWarning(true);
        setSecondsRemaining(WARNING_COUNTDOWN_SECONDS);
      }
    }, 5000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserActivity);
      });
      if (timerCheckIntervalRef.current) {
        clearInterval(timerCheckIntervalRef.current);
      }
    };
  }, [isAuthenticated, user, showWarning]);

  // Countdown timer while warning modal is visible
  useEffect(() => {
    if (!showWarning) return;

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          handleSignOutDueToInactivity();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarning, handleSignOutDueToInactivity]);

  if (!showWarning) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-md border border-line shadow-2xl max-w-md w-full p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Icon name="clock" size={24} />
        </div>

        <div>
          <h2 id="inactivity-title" className="font-heading text-xl font-bold uppercase tracking-tight text-navy-900">
            Session Inactivity Warning
          </h2>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            For college data security, your session will automatically terminate in{" "}
            <span className="font-bold text-amber-700 text-sm">{secondsRemaining} seconds</span>{" "}
            unless you confirm you are still working.
          </p>
        </div>

        <div className="p-3 rounded bg-paper border border-line text-[11px] text-ink-soft">
          Tip: Select <em>&ldquo;Keep me signed in&rdquo;</em> on your next login if using a private, personal computer.
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={resetActivity}
            className="flex-1 px-4 py-2.5 bg-navy-900 hover:bg-navy-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={handleSignOutDueToInactivity}
            className="px-4 py-2.5 bg-paper hover:bg-line text-ink-soft hover:text-navy-900 rounded-sm text-xs font-semibold transition-colors border border-line"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
};
