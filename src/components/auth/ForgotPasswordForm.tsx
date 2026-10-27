"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { requestPasswordResetAction } from "@/app/login/actions";
import { siteConfig } from "@/content/siteConfig";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordResetAction(cleanEmail);
      if (!result.success) {
        setErrorMessage(result.error || "Unable to send reset instructions. Please verify your email.");
      } else {
        setSuccessMessage(
          result.message ||
            `A password reset link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`
        );
      }
    } catch {
      setErrorMessage("A connection error occurred. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-md border border-line shadow-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-line pb-4">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-navy-900">
            Forgot Your Password?
          </h2>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            Enter the email address registered with your Smartminds student or staff portal. We will send you an automated, secure link to choose a new password.
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

        {successMessage ? (
          <div className="space-y-5">
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
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="leading-relaxed text-xs">{successMessage}</p>
              <p className="text-[11px] text-emerald-800">
                If the email doesn't appear in your inbox within 2 minutes, please check your spam or promotions folder.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 rounded-sm bg-navy-900 text-white text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 flex-1"
              >
                <Icon name="arrow-left" size={14} />
                <span>Return to sign in</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  setEmail("");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-sm border border-line bg-paper text-navy-900 text-xs font-semibold hover:border-navy-900 transition-colors"
              >
                Send to another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-password-email"
                className="block text-sm font-semibold text-navy-900"
              >
                Account Email Address
              </label>
              <input
                id="forgot-password-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@example.com"
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
              disabled={isLoading}
              className="min-h-[48px]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </span>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-ink-soft hover:text-navy-900 underline font-medium min-h-[44px] inline-flex items-center gap-1"
              >
                <Icon name="arrow-left" size={14} />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Alternative Help & Temporary Password Box */}
      <div className="bg-white rounded-md border border-line p-5 text-xs text-ink-soft space-y-3 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-navy-900">
          <Icon name="info" size={15} />
          <span>New student or temporary password?</span>
        </div>
        <p className="leading-relaxed">
          If you just enrolled or received a temporary password from College Administration, you can sign in directly on the{" "}
          <Link href="/login" className="font-semibold text-navy-900 underline hover:text-gold-700">
            Sign In page
          </Link>{" "}
          using your temporary credentials.
        </p>
        <p className="text-[11px] text-ink-soft border-t border-line/60 pt-2">
          Need immediate assistance? Contact admissions at{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="font-medium text-navy-900 underline">
            {siteConfig.contact.email}
          </a>{" "}
          or message on WhatsApp:{" "}
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-navy-900 underline"
          >
            {siteConfig.contact.whatsappDisplay}
          </a>.
        </p>
      </div>
    </div>
  );
}
