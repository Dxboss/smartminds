"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { resetPasswordAction } from "@/app/login/actions";

export const ResetPasswordForm: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [token] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 12 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordAction({
        token: token || "self_service_direct",
        email,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to reset password. Please try again.");
      } else {
        setSuccessMessage(
          result.message || "Your password has been successfully reset! You can now sign in."
        );
      }
    } catch {
      setErrorMessage("A connection error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-md border border-line shadow-card p-6 sm:p-8 space-y-6">
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-sm text-sm text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-950 text-base">
            <Icon name="check-circle" size={20} className="text-emerald-700" />
            <span>Password Reset Completed</span>
          </div>
          <p className="leading-relaxed text-sm">{successMessage}</p>
          <p className="text-xs text-emerald-800">
            A confirmation security alert has been dispatched to your email address.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => router.push("/login")}
            className="min-h-[48px]"
          >
            <span>Proceed to Sign In</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-line pb-4">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-navy-900">
            Choose a New Password
          </h2>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            Please enter your account email and choose a strong new password for your portal access.
          </p>
        </div>

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

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reset-page-email" className="block text-sm font-semibold text-navy-900">
              Account Email
            </label>
            <input
              id="reset-page-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@smartmindstraining.co.uk"
              required
              className="w-full px-3.5 py-3 text-base text-ink bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-colors min-h-[44px]"
            />
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="new-password"
                className="block text-sm font-semibold text-navy-900"
              >
                New Password (minimum 12 characters)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-navy-900 hover:text-gold-700 underline font-medium min-h-[44px] flex items-center"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="new-password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              required
              className="w-full px-3.5 py-3 text-base text-ink bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-colors min-h-[44px]"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-semibold text-navy-900"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              required
              className="w-full px-3.5 py-3 text-base text-ink bg-paper border border-line rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-colors min-h-[44px]"
            />
          </div>

          {/* Submit */}
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
                <span>Updating Password...</span>
              </span>
            ) : (
              <span>Save New Password</span>
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-ink-soft hover:text-navy-900 underline font-medium min-h-[44px] inline-flex items-center gap-1"
            >
              <Icon name="arrow-left" size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-ink-soft flex items-center justify-center gap-2">
        <Icon name="shield-check" size={16} className="text-navy-900 flex-shrink-0" />
        <span>Self-service secure credentials update with encrypted TLS transmission.</span>
      </div>
    </div>
  );
};
