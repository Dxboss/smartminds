import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Icon } from "@/components/ui/Icon";

export const instant = false;

export const metadata: Metadata = {
  title: "Forgot Password | Smartminds Training College",
  description: "Self-service password recovery for Smartminds Training College learners, tutors, and administrators.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ForgotPasswordPage() {
  return (
    <div className="py-12 md:py-20 bg-paper/50 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <Container>
        <div className="max-w-xl mx-auto text-center mb-8 space-y-3">
          <div className="flex justify-center mb-1">
            <Link
              href="/"
              aria-label="Smartminds Training College Home"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 rounded-sm"
            >
              <img
                src="/images/logo-color.png"
                alt="Smartminds Training College"
                className="h-16 w-auto object-contain hover:scale-[1.02] transition-transform"
              />
            </Link>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-navy-900">
            Account recovery
          </h1>
          <p className="text-base text-ink-soft">
            Reset your Smartminds student or staff portal password.
          </p>
        </div>

        <ForgotPasswordForm />
      </Container>
    </div>
  );
}
