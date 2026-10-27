import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Icon } from "@/components/ui/Icon";


export const metadata: Metadata = {
  title: "Reset Password | Smartminds Training College",
  description: "Self-service password reset for Smartminds Training College learners, tutors and administrators.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ResetPasswordPage() {
  return (
    <div className="py-12 md:py-20 bg-paper/50 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <Container>
        <div className="max-w-xl mx-auto text-center mb-8 space-y-2">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-navy-900">
            Reset Password
          </h1>
          <p className="text-base text-ink-soft">
            Secure self-service account recovery for students, tutors and staff.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="w-full max-w-xl mx-auto bg-white rounded-md border border-line p-8 text-center text-sm text-ink-soft">
              <span className="inline-block w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
              Loading recovery details...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="max-w-xl mx-auto mt-8 pt-6 border-t border-line text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-900 transition-colors"
          >
            <Icon name="arrow-left" size={14} />
            <span>Return to Login</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
