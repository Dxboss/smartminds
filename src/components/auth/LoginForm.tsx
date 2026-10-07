"use client";

import React, { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const LoginForm: React.FC = () => {
  const { loginAs, loginWithCredentials } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid college email address.");
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage("Please enter your password (minimum 4 characters).");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithCredentials(email, selectedRole);
    } catch {
      setErrorMessage("Authentication failed. Please verify your details.");
      setIsLoading(false);
    }
  };

  const roleTabInfo = [
    {
      role: "student" as UserRole,
      label: "Learner Portal",
      description: "Class timetable, course units, homework & payment plan",
    },
    {
      role: "staff" as UserRole,
      label: "Tutor Console",
      description: "Live sessions, cohort roster, and assignment grading",
    },
    {
      role: "owner_admin" as UserRole,
      label: "Admin / Owner",
      description: "Live leads inbox, student enrolments & tuition ledger",
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Role Switcher Tabs */}
      <div className="bg-paper p-1.5 rounded-sm border border-line">
        <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Login Role Selection">
          {roleTabInfo.map((tab) => {
            const isSelected = selectedRole === tab.role;
            return (
              <button
                key={tab.role}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedRole(tab.role);
                  setErrorMessage("");
                }}
                className={`py-3 px-2 text-center text-sm font-semibold rounded-sm transition-all min-h-[44px] flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-white text-navy-900 shadow-sm border border-line font-bold"
                    : "text-ink-soft hover:text-navy-900 hover:bg-white/60"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role explanation */}
      <div className="text-center px-4">
        <p className="text-sm text-ink-soft">
          {roleTabInfo.find((r) => r.role === selectedRole)?.description}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-800 flex items-start gap-2.5"
            >
              <Icon name="alert-circle" size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label
              htmlFor="college-email"
              className="block text-sm font-semibold text-navy-900"
            >
              Registered Email Address
            </label>
            <div className="relative">
              <input
                id="college-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === "student"
                    ? "learner@example.co.uk"
                    : selectedRole === "staff"
                    ? "tutor@smartmindstraining.co.uk"
                    : "admin@smartmindstraining.co.uk"
                }
                autoComplete="email"
                required
                className="w-full px-3.5 py-3 text-base text-ink bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-colors min-h-[44px]"
              />
            </div>
            <p className="text-xs text-ink-soft">
              Enter the email address registered during your enrolment or induction.
            </p>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="college-password"
                className="block text-sm font-semibold text-navy-900"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset request received. Please contact college support at info@smartmindstraining.co.uk if you are locked out."
                  )
                }
                className="text-xs text-navy-900 hover:text-gold-700 underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="college-password"
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
                <Icon name="info" size={18} />
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="remember-session"
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-line text-navy-900 focus:ring-navy-900"
            />
            <label
              htmlFor="remember-session"
              className="text-sm text-ink-soft select-none"
            >
              Keep me signed in on this device
            </label>
          </div>

          {/* Submit CTA */}
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
              <span>Sign in to {roleTabInfo.find((r) => r.role === selectedRole)?.label}</span>
            )}
          </Button>
        </form>

        {/* 1-Click Preview Demo Accounts for Pair Programming & Testing */}
        <div className="mt-8 pt-6 border-t border-line space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-900">
            <span className="w-2 h-2 rounded-full bg-gold-500" />
            <span>Instant Preview Access (1-Click Evaluation)</span>
          </div>
          <p className="text-xs text-ink-soft">
            Test any of the 3 portal environments directly without entering credentials:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => loginAs("student")}
              className="p-3 text-left bg-paper hover:bg-gold-300/20 border border-line hover:border-gold-500 rounded-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900">Sarah Jenkins</span>
                <span className="text-[10px] uppercase font-bold text-navy-900 bg-white px-1.5 py-0.5 rounded border border-line">
                  Learner
                </span>
              </div>
              <p className="text-[11px] text-ink-soft mt-1 leading-snug">
                Adult Care Diploma
              </p>
              <span className="text-[11px] font-semibold text-navy-900 group-hover:text-gold-700 mt-2 flex items-center gap-1">
                Open Learner Portal <Icon name="arrow-right" size={12} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => loginAs("staff")}
              className="p-3 text-left bg-paper hover:bg-gold-300/20 border border-line hover:border-gold-500 rounded-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900">Dr. M. Vance</span>
                <span className="text-[10px] uppercase font-bold text-navy-900 bg-white px-1.5 py-0.5 rounded border border-line">
                  Tutor
                </span>
              </div>
              <p className="text-[11px] text-ink-soft mt-1 leading-snug">
                Faculty Assessor
              </p>
              <span className="text-[11px] font-semibold text-navy-900 group-hover:text-gold-700 mt-2 flex items-center gap-1">
                Open Tutor Console <Icon name="arrow-right" size={12} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => loginAs("owner_admin")}
              className="p-3 text-left bg-paper hover:bg-gold-300/20 border border-line hover:border-gold-500 rounded-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900">College Admin</span>
                <span className="text-[10px] uppercase font-bold text-navy-900 bg-white px-1.5 py-0.5 rounded border border-line">
                  Owner
                </span>
              </div>
              <p className="text-[11px] text-ink-soft mt-1 leading-snug">
                Leads & Enrolments
              </p>
              <span className="text-[11px] font-semibold text-navy-900 group-hover:text-gold-700 mt-2 flex items-center gap-1">
                Open Admin Hub <Icon name="arrow-right" size={12} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="text-center text-xs text-ink-soft flex items-center justify-center gap-2">
        <Icon name="shield-check" size={16} className="text-navy-900" />
        <span>
          256-bit encrypted college portal access. Protected under Smartminds College Information Security Policy.
        </span>
      </div>
    </div>
  );
};
