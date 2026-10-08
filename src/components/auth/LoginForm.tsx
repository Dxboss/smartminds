"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  authenticateUser,
  confirmRoleSelection,
  AvailableRole,
  RoleType,
} from "@/app/login/actions";

export const LoginForm: React.FC = () => {
  const router = useRouter();

  // Screen state: "credentials" | "select_role" | "requires_2fa"
  const [step, setStep] = useState<"credentials" | "select_role" | "requires_2fa">(
    "credentials"
  );

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false); // Unticked by default per PRD
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPasswordInfo, setShowForgotPasswordInfo] = useState(false);

  // Server-determined state
  const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);

  // Staging evaluation demo access flag (off by default, never in production)
  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.DEMO_MODE === "true";

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setShowForgotPasswordInfo(false);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Please enter your password (minimum 6 characters).");
      return;
    }

    setIsLoading(true);
    try {
      // The client sends only credentials. The SERVER reads the user's role.
      const result = await authenticateUser({
        email,
        password,
        keepSignedIn,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Authentication failed. Please verify your details.");
        setIsLoading(false);
        return;
      }

      // Case 1: Account holds multiple roles -> user picks which area to enter
      if (result.requiresRoleSelection && result.availableRoles) {
        setAvailableRoles(result.availableRoles);
        setStep("select_role");
        setIsLoading(false);
        return;
      }

      // Case 2: Staff or Admin role -> requires second verification step
      if (result.requires2FA) {
        setStep("requires_2fa");
        setIsLoading(false);
        return;
      }

      // Case 3: Single role ready for redirect (e.g. student)
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        return;
      }

      setIsLoading(false);
    } catch {
      setErrorMessage("A connection error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRoleSelection = async (role: RoleType) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await confirmRoleSelection(email, role);

      if (result.requires2FA) {
        setStep("requires_2fa");
        setIsLoading(false);
        return;
      }

      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        return;
      }

      setIsLoading(false);
    } catch {
      setErrorMessage("Could not route to the selected area. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResetToCredentials = () => {
    setStep("credentials");
    setAvailableRoles([]);
    setErrorMessage("");
    setIsLoading(false);
  };

  // =========================================================================
  // Screen 1: Multi-role area selection
  // (Server identified several roles; user picks which area to enter)
  // =========================================================================
  if (step === "select_role") {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 border-b border-line pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-navy-900/5 text-navy-900 text-xs font-semibold">
              <Icon name="users" size={14} />
              <span>Multi-Role Account</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-navy-900">
              Select Area to Enter
            </h2>
            <p className="text-sm text-ink-soft">
              Your account ({email}) is authorised for multiple areas. Please choose which portal to open.
            </p>
          </div>

          <div className="space-y-3">
            {availableRoles.map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRoleSelection(item.role)}
                disabled={isLoading}
                className="w-full text-left p-4 rounded-sm border border-line bg-paper hover:bg-white hover:border-navy-900 transition-all flex items-center justify-between group min-h-[56px]"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy-900">
                      {item.label}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-white border border-line text-ink-soft">
                      {item.role === "staff" ? "Tutor" : item.role === "admin" ? "Staff" : "Learner"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft">{item.description}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-colors flex-shrink-0">
                  <Icon name="chevron-right" size={16} />
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleResetToCredentials}
              className="text-xs font-semibold text-ink-soft hover:text-navy-900 inline-flex items-center gap-1.5"
            >
              <Icon name="arrow-left" size={14} />
              <span>Sign in with a different account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Screen 2: Two-Step Verification Placeholder Screen
  // (Staff & Admin roles get a second verification step. Not faked.)
  // =========================================================================
  if (step === "requires_2fa") {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-navy-900/5 text-navy-900 mx-auto flex items-center justify-center">
              <Icon name="shield-check" size={24} />
            </div>
            {/* PRD Item 1: Heading in sentence case matching other headings */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900">
              Two-step verification
            </h2>
            <p className="text-sm text-ink-soft">
              Staff and administrative accounts require a second verification factor before access is granted.
            </p>
          </div>

          {/*
            PRD Item 3: Do not display an account name or role on this screen unless
            it came from a verified server session.
            Roles and account identities are NEVER read from browser storage (localStorage),
            URL search parameters, or client form fields.
          */}

          {/* PRD Item 2: Plain message for visitors */}
          <div className="p-4 bg-paper rounded-sm border border-line text-center space-y-1">
            <p className="text-sm font-semibold text-navy-900">
              Staff sign-in opens soon. If you are a student, your login details are sent when you enrol.
            </p>
          </div>

          {/*
            PRD Item 2: Technical developer notice is shown ONLY when the DEMO_MODE environment
            flag is true (off by default and excluded from production).
            TODO: Phase 1b - Integrate Supabase Auth MFA / TOTP verification (PRD Section 12.1 & 17).
          */}
          {isDemoMode && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm space-y-2">
              <div className="flex items-start gap-2.5">
                <Icon name="info" size={18} className="text-navy-900 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-navy-900">
                    Developer Notice (DEMO_MODE=true)
                  </p>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Real two-step verification using an authenticator app (TOTP) is specified for Phase 1b Supabase Auth rollout. Live access is restricted until authentication services and 2FA secrets are provisioned.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="md"
              onClick={handleResetToCredentials}
              className="min-h-[44px]"
            >
              <Icon name="arrow-left" size={16} />
              <span>Return to sign in</span>
            </Button>
          </div>
        </div>

        {/* Security line */}
        <div className="text-center text-xs text-ink-soft flex items-center justify-center gap-2">
          <Icon name="shield-check" size={16} className="text-navy-900" />
          <span>Protected sign-in. Staff accounts use two-step verification.</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Screen 3: Standard Single Sign-In Form (PRD Section 3 & 12.1)
  // =========================================================================
  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Main Login Card */}
      <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-8">
        <form onSubmit={handleCredentialsSubmit} className="space-y-5" noValidate>
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-800 flex items-start gap-2.5"
            >
              <Icon name="alert-circle" size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {showForgotPasswordInfo && (
            <div
              role="status"
              className="p-3.5 bg-paper border border-line rounded-sm text-xs text-ink-soft space-y-1.5"
            >
              <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                <Icon name="info" size={14} />
                <span>Password Reset Support</span>
              </p>
              <p className="leading-relaxed">
                To reset your password, contact college support at{" "}
                <a
                  href="mailto:admissions@smartmindstraining.co.uk"
                  className="font-medium text-navy-900 underline"
                >
                  admissions@smartmindstraining.co.uk
                </a>
                . Automated self-service password recovery will be enabled with Phase 1b authentication.
              </p>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-navy-900"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@smartmindstraining.co.uk"
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
              <button
                type="button"
                onClick={() => setShowForgotPasswordInfo(!showForgotPasswordInfo)}
                className="text-xs text-navy-900 hover:text-gold-700 underline font-medium"
              >
                Forgot password?
              </button>
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
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft hover:text-navy-900 min-w-[44px] justify-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "close" : "info"} size={18} />
              </button>
            </div>
          </div>

          {/* Keep me signed in (unticked by default) */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="keep-signed-in"
              name="keepSignedIn"
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="w-4 h-4 rounded-sm border-line text-navy-900 focus:ring-navy-900"
            />
            <label
              htmlFor="keep-signed-in"
              className="text-sm text-ink-soft select-none cursor-pointer"
            >
              Keep me signed in
            </label>
          </div>

          {/* Single Submit Button */}
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
              <span>Sign in</span>
            )}
          </Button>
        </form>

        {/*
          Staging Preview Demo Access (Strictly gated by DEMO_MODE environment flag;
          off by default and never included in standard production builds).
        */}
        {isDemoMode && (
          <div className="mt-8 pt-6 border-t border-line space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-900">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              <span>Staging Preview Test Credentials (DEMO_MODE=true)</span>
            </div>
            <p className="text-xs text-ink-soft">
              Click any role to test server-side authentication and routing:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("sarah.jenkins@example.co.uk");
                  setPassword("password123");
                }}
                className="p-2.5 text-left bg-paper hover:bg-white border border-line rounded-sm text-xs"
              >
                <span className="font-bold text-navy-900 block">Student</span>
                <span className="text-[11px] text-ink-soft block">Learner route</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("marcus.vance@smartmindstraining.co.uk");
                  setPassword("password123");
                }}
                className="p-2.5 text-left bg-paper hover:bg-white border border-line rounded-sm text-xs"
              >
                <span className="font-bold text-navy-900 block">Tutor (Staff)</span>
                <span className="text-[11px] text-ink-soft block">Triggers 2FA</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("multi.role@smartmindstraining.co.uk");
                  setPassword("password123");
                }}
                className="p-2.5 text-left bg-paper hover:bg-white border border-line rounded-sm text-xs"
              >
                <span className="font-bold text-navy-900 block">Multi-Role</span>
                <span className="text-[11px] text-ink-soft block">Area picker</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Neutral Security Note (Replaces 256-bit encrypted claim) */}
      <div className="text-center text-xs text-ink-soft flex items-center justify-center gap-2">
        <Icon name="shield-check" size={16} className="text-navy-900 flex-shrink-0" />
        <span>Protected sign-in. Staff accounts use two-step verification.</span>
      </div>
    </div>
  );
};
