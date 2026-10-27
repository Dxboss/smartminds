"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  authenticateUser,
  requestPasswordResetAction,
} from "@/app/login/actions";
import { useAuth } from "@/context/AuthContext";

export interface LoginFormProps {
  reason?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ reason }) => {
  const router = useRouter();

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Ensure loading spinner is strictly disabled on mount, timeout signout, or back-forward page cache
  useEffect(() => {
    setIsLoading(false);
    const handlePageShow = () => {
      setIsLoading(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [reason]);

  // Forgot password view state
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Self-service password reset submission
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setResetSuccessMessage("");

    if (!resetEmail || !resetEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSendingReset(true);
    try {
      const result = await requestPasswordResetAction(resetEmail);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to dispatch reset link.");
      } else {
        setResetSuccessMessage(
          result.message ||
            "A password reset link has been dispatched to your email address."
        );
      }
    } catch {
      setErrorMessage("A connection error occurred. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Standard authentication submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Please enter your password (minimum 6 characters).");
      return;
    }

    setIsLoading(true);

    // Safety timeout: restore button if navigation doesn't occur within 8 seconds
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    try {
      const result = await authenticateUser({
        email,
        password,
        keepSignedIn,
      });

      if (!result.success || !result.redirectUrl) {
        clearTimeout(safetyTimer);
        setErrorMessage(
          result.error ||
            "Invalid credentials. Please verify your email and password."
        );
        setIsLoading(false);
        return;
      }

      // Sync client session storage cleanly
      const targetRole =
        email.toLowerCase() === "thegeorgedigitals@gmail.com" || email.includes("super")
          ? "super_admin"
          : result.redirectUrl.startsWith("/admin")
          ? "owner_admin"
          : result.redirectUrl.startsWith("/staff")
          ? "staff"
          : "student";

      try {
        const demoUser = {
          id: targetRole === "owner_admin" ? "user-owner-01" : `usr_${targetRole}`,
          name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          email,
          role: targetRole,
          keepSignedIn,
        };
        localStorage.setItem("smartminds_auth_session_v1", JSON.stringify(demoUser));
        window.dispatchEvent(new Event("smartminds_auth_updated"));
      } catch {}

      // Authoritative page load with fresh server-side session cookie
      window.location.href = result.redirectUrl;
    } catch {
      clearTimeout(safetyTimer);
      setErrorMessage("A connection error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Main Login Card */}
      <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-8 space-y-6">
        {isForgotPasswordView ? (
          /* Self-Service Forgot Password Card */
          <div className="space-y-5">
            <div className="border-b border-line pb-4">
              <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-navy-900">
                Reset Your Password
              </h3>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Enter your account email below. We will immediately dispatch an automated, secure link so you can choose a new password directly.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-800 flex items-start gap-2.5"
              >
                <Icon
                  name="alert-circle"
                  size={18}
                  className="text-red-600 mt-0.5 flex-shrink-0"
                />
                <span>{errorMessage}</span>
              </div>
            )}

            {resetSuccessMessage ? (
              <div className="space-y-4">
                <div
                  role="status"
                  className="p-4 bg-emerald-50 border border-emerald-300 rounded-sm text-sm text-emerald-900 space-y-2"
                >
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <Icon
                      name="check-circle"
                      size={18}
                      className="text-emerald-700"
                    />
                    <span>Instructions Dispatched</span>
                  </div>
                  <p className="leading-relaxed text-xs">{resetSuccessMessage}</p>
                  <p className="text-[11px] text-emerald-800">
                    If you do not see the message in your inbox within 2 minutes, please check your spam or junk folder.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  size="md"
                  onClick={() => {
                    setIsForgotPasswordView(false);
                    setResetSuccessMessage("");
                    setErrorMessage("");
                  }}
                  className="min-h-[44px]"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-semibold text-navy-900"
                  >
                    Account Email Address
                  </label>
                  <input
                    id="reset-email"
                    name="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@smartmindstraining.co.uk"
                    autoComplete="email"
                    required
                    className="w-full px-3.5 py-3 text-base text-ink bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-colors min-h-[44px]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={isSendingReset}
                  className="min-h-[48px]"
                >
                  {isSendingReset ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Reset Instructions...</span>
                    </span>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordView(false);
                      setErrorMessage("");
                    }}
                    className="text-xs text-ink-soft hover:text-navy-900 underline font-medium min-h-[44px] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="arrow-left" size={14} />
                    <span>Back to sign in</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5" noValidate>
            {reason === "timeout" && !errorMessage && (
              <div
                role="status"
                className="p-3.5 bg-amber-50 border border-amber-300 rounded-sm text-xs text-amber-950 flex items-start gap-2.5"
              >
                <Icon
                  name="clock"
                  size={18}
                  className="text-amber-700 mt-0.5 flex-shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-950">Signed out due to inactivity</p>
                  <p className="text-amber-900 leading-relaxed">
                    For college security, your previous session was signed out. Please enter your password to resume.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-800 flex items-start gap-2.5"
              >
                <Icon
                  name="alert-circle"
                  size={18}
                  className="text-red-600 mt-0.5 flex-shrink-0"
                />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-navy-900"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@smartmindstraining.co.uk"
                autoComplete="email"
                required
                className="w-full px-3.5 py-3 text-base text-ink bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-colors min-h-[44px]"
              />
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-navy-900"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-navy-900 hover:text-gold-700 underline font-medium min-h-[44px] flex items-center cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-3.5 py-3 pr-11 text-base text-ink bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-colors min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft hover:text-navy-900 min-w-[44px] justify-center cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "close" : "info"} size={18} />
                </button>
              </div>
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="keep-signed-in"
                name="keepSignedIn"
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 rounded-sm border-line text-navy-900 focus:ring-navy-900 cursor-pointer"
              />
              <label
                htmlFor="keep-signed-in"
                className="text-sm text-ink-soft select-none cursor-pointer"
              >
                Keep me signed in
              </label>
            </div>

            {/* Sign in Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={isLoading}
              className="mt-2 min-h-[48px]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
