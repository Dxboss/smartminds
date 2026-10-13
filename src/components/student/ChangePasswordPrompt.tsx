"use client";

import React, { useState, useTransition } from "react";
import { changePasswordAction } from "@/app/login/actions";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface Props {
  userEmail: string;
}

export const ChangePasswordPrompt: React.FC<Props> = ({ userEmail }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isDismissed && !isSuccess) return null;

  if (isSuccess) {
    return (
      <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
        <div className="flex items-center gap-2 font-semibold">
          <Icon name="check-circle" size={18} className="text-emerald-600" />
          <span>Your private password has been successfully established and your student portal is now secure.</span>
        </div>
        <button
          type="button"
          onClick={() => setIsSuccess(false)}
          className="text-emerald-700 hover:text-emerald-900 underline text-xs font-bold"
        >
          Dismiss
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter both fields.");
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction({ newPassword });
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.error || "Failed to update password. Please try again.");
      }
    });
  };

  return (
    <div className="p-5 sm:p-6 rounded-md bg-amber-50 border border-amber-200 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="shield-check" size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-xs border border-amber-300">
              Security Notice · Action Required
            </span>
            <h2 className="font-heading text-xl font-bold text-navy-900 mt-1">
              Choose Your Permanent Private Password
            </h2>
            <p className="text-xs text-ink-soft mt-1 leading-relaxed max-w-2xl">
              You are currently authenticated using the temporary college password sent to <strong>{userEmail}</strong>. To protect your student records, coursework submissions, and academic files, please set your permanent password.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pt-2 border-t border-amber-200/60 max-w-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-navy-900 mb-1">
              New Permanent Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-xs rounded-sm border border-line bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 min-h-[40px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-navy-900 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 text-xs rounded-sm border border-line bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 min-h-[40px]"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-sm bg-red-100 border border-red-200 text-red-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending}
            className="cursor-pointer font-bold"
          >
            {isPending ? "Securing Account..." : "Save Permanent Password"}
          </Button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-xs text-ink-soft hover:text-navy-900 font-semibold"
          >
            Remind me next time
          </button>
        </div>
      </form>
    </div>
  );
};
